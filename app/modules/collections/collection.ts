import mongoose from 'mongoose';
import type { FindOptions } from '~/modules/common/types';
import collectionSchema from '~/modules/documents/schemas/collection.schema';
import type { Collection } from './collections.types';

const CollectionModel = mongoose.model('Collection', collectionSchema);

export class CollectionService {
  private static toCollection(doc: any): Collection {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<Collection[]> {
    const match = options?.match || {};
    let query = CollectionModel.find(match);

    if (options?.populate?.length) {
      query = query.populate(options.populate);
    }

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.pagination) {
      query = query.skip(options.pagination.skip).limit(options.pagination.limit);
    }

    const docs = await query;
    return docs.map(doc => this.toCollection(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return CollectionModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<Collection | null> {
    if (!id) return null;
    const doc = await CollectionModel.findById(id);
    return doc ? this.toCollection(doc) : null;
  }

  static async findOne(match: Record<string, any>): Promise<Collection | null> {
    const doc = await CollectionModel.findOne(match);
    return doc ? this.toCollection(doc) : null;
  }

  static async create(data: Partial<Collection>): Promise<Collection> {
    const doc = await CollectionModel.create(data);
    return this.toCollection(doc);
  }

  static async updateById(id: string, updates: Partial<Collection>): Promise<Collection | null> {
    const doc = await CollectionModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toCollection(doc) : null;
  }

  static async deleteById(id: string): Promise<Collection | null> {
    const doc = await CollectionModel.findByIdAndDelete(id);
    return doc ? this.toCollection(doc) : null;
  }

  static async findByProject(projectId: string): Promise<Collection[]> {
    return this.find({ match: { project: projectId } });
  }

  static async deleteByProject(projectId: string): Promise<number> {
    const result = await CollectionModel.deleteMany({ project: projectId });
    return result.deletedCount || 0;
  }
}
