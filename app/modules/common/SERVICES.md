# Service Layer Patterns

## Overview

The service layer provides a consistent interface for data operations across domain models. All services follow the same patterns for querying, creating, updating, and deleting documents.

## Common FindOptions Type

All services share the `FindOptions` interface for consistent query API:

```typescript
import type { FindOptions } from "~/modules/common/types";

interface FindOptions {
  match?: Record<string, any>; // MongoDB query filter
  sort?: Record<string, 1 | -1>; // Sort fields (1 = asc, -1 = desc)
  pagination?: {
    // Pagination control
    skip: number; // Skip N documents
    limit: number; // Return N documents
  };
  populate?: string[]; // Populate references
}
```

## Service Interface

All services follow this pattern:

```typescript
export class ServiceName {
  // Query operations
  static async find(options?: FindOptions): Promise<T[]>;
  static async findById(id: string | undefined): Promise<T | null>;
  static async count(match?: Record<string, any>): Promise<number>;

  // Mutation operations
  static async create(data: Partial<T>): Promise<T>;
  static async updateById(id: string, updates: Partial<T>): Promise<T | null>;
  static async deleteById(id: string): Promise<T | null>;
}
```

## Usage Examples

### Find with filtering

```typescript
const users = await UserService.find({
  match: { role: "ADMIN" },
});
```

### Find with sorting

```typescript
const teams = await TeamService.find({
  sort: { name: 1 }, // Sort by name ascending
});
```

### Find with pagination

```typescript
const users = await UserService.find({
  pagination: { skip: 10, limit: 20 },
});
```

### Find with all options

```typescript
const users = await UserService.find({
  match: { isRegistered: true },
  sort: { username: 1 },
  pagination: { skip: 0, limit: 50 },
  populate: ["teams"],
});
```

### Count documents

```typescript
const adminCount = await UserService.count({ role: "SUPER_ADMIN" });
const totalUsers = await UserService.count();
```

### Single document operations

```typescript
const user = await UserService.findById(userId);
const created = await UserService.create({ username: "new" });
const updated = await UserService.updateById(id, { username: "updated" });
const deleted = await UserService.deleteById(id);
```

## Implementation Template

When creating a new service:

```typescript
import mongoose from "mongoose";
import schema from "~/modules/documents/schemas/model.schema";
import type { ModelType } from "./model.types";
import type { FindOptions } from "~/modules/common/types";

const Model = mongoose.model("ModelName", schema);

export class ModelService {
  private static toModel(doc: any): ModelType {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<ModelType[]> {
    const match = options?.match || {};
    let query = Model.find(match);

    if (options?.populate?.length) {
      query = query.populate(options.populate);
    }

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.pagination) {
      query = query
        .skip(options.pagination.skip)
        .limit(options.pagination.limit);
    }

    const docs = await query.exec();
    return docs.map((doc) => this.toModel(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return Model.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<ModelType | null> {
    if (!id) return null;
    const doc = await Model.findById(id);
    return doc ? this.toModel(doc) : null;
  }

  static async create(data: Partial<ModelType>): Promise<ModelType> {
    const doc = await Model.create(data);
    return this.toModel(doc);
  }

  static async updateById(
    id: string,
    updates: Partial<ModelType>,
  ): Promise<ModelType | null> {
    const doc = await Model.findByIdAndUpdate(id, updates, {
      new: true,
    }).exec();
    return doc ? this.toModel(doc) : null;
  }

  static async deleteById(id: string): Promise<ModelType | null> {
    const doc = await Model.findByIdAndDelete(id).exec();
    return doc ? this.toModel(doc) : null;
  }
}
```

## Key Patterns

- **Private `toModel()` helper**: Converts Mongoose documents to domain models using `toJSON({ flattenObjectIds: true })`
- **Optional parameters**: All query methods accept optional FindOptions
- **Consistent null handling**: Methods return `null` when document not found (never `undefined`)
- **Chainable queries**: Query building is internal; services expose complete methods
- **Always call `.exec()`**: Before returning from Mongoose queries for proper type handling

## Services

- `UserService` - User authentication and profile management
- `TeamService` - Team organization and membership

## Testing

Services should be tested with:

- Query filtering (match)
- Sorting (ascending/descending)
- Pagination (skip/limit)
- CRUD operations
- Edge cases (not found, invalid IDs)

See `user.test.ts` and `teams.route.test.ts` for examples.
