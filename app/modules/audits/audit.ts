import mongoose from "mongoose";
import auditSchema from "~/lib/schemas/audit.schema";
import type { AuditRecord } from "./audit.types";
import { UserService } from "../users/user";

const AuditModel =
  mongoose.models.Audit || mongoose.model("Audit", auditSchema);

export class AuditService {
  private static toAudit(doc: any): AuditRecord {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async create(
    data: Omit<AuditRecord, "_id" | "createdAt" | "performedByUsername"> & {
      performedByUsername?: string;
    },
  ): Promise<AuditRecord> {
    if (!data.performedBy) {
      throw new Error("performedBy is required for audit records");
    }

    let performedByUsername = data.performedByUsername;

    if (!performedByUsername) {
      const user = await UserService.findById(data.performedBy);
      performedByUsername = user?.username || "Unknown";
    }

    const doc = await AuditModel.create({
      ...data,
      performedByUsername,
      createdAt: new Date(),
    });
    return this.toAudit(doc);
  }

  static async createSystem(
    data: Omit<
      AuditRecord,
      "_id" | "createdAt" | "performedBy" | "performedByUsername"
    >,
  ): Promise<AuditRecord> {
    const doc = await AuditModel.create({
      ...data,
      performedBy: undefined,
      performedByUsername: "System",
      createdAt: new Date(),
    });
    return this.toAudit(doc);
  }

  static async find(options?: {
    match?: Record<string, any>;
    sort?: Record<string, 1 | -1>;
    pagination?: { skip: number; limit: number };
  }): Promise<AuditRecord[]> {
    const match = options?.match || {};
    let query = AuditModel.find(match);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.pagination) {
      query = query
        .skip(options.pagination.skip)
        .limit(options.pagination.limit);
    }

    const docs = await query.exec();
    return docs.map((doc) => this.toAudit(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return AuditModel.countDocuments(match);
  }
}
