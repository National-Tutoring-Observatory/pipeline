import mongoose from "mongoose";
import type { FindOptions } from "~/modules/common/types";
import fileSchema from "~/lib/schemas/file.schema";
import type { File } from "./files.types";

const FileModel = mongoose.model("File", fileSchema);

export class FileService {
  private static toFile(doc: any): File {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<File[]> {
    const match = options?.match || {};
    let query = FileModel.find(match);

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

    const docs = await query;
    return docs.map((doc) => this.toFile(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return FileModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<File | null> {
    if (!id) return null;
    const doc = await FileModel.findById(id);
    return doc ? this.toFile(doc) : null;
  }

  static async create(data: Partial<File>): Promise<File> {
    const doc = await FileModel.create(data);
    return this.toFile(doc);
  }

  static async updateById(
    id: string,
    updates: Partial<File>,
  ): Promise<File | null> {
    const doc = await FileModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toFile(doc) : null;
  }

  static async deleteById(id: string): Promise<File | null> {
    const doc = await FileModel.findByIdAndDelete(id);
    return doc ? this.toFile(doc) : null;
  }

  static async findByProject(projectId: string): Promise<File[]> {
    return this.find({ match: { project: projectId } });
  }

  static async deleteByProject(projectId: string): Promise<number> {
    const result = await FileModel.deleteMany({ project: projectId });
    return result.deletedCount || 0;
  }
}
