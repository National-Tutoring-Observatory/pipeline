import pick from "lodash/pick";
import mongoose from "mongoose";
import codebookVersionSchema from "~/lib/schemas/codebookVersion.schema";
import type { FindOptions } from "~/modules/common/types";
import type { CodebookVersion } from "./codebooks.types";

const CodebookVersionModel =
  mongoose.models.CodebookVersion ||
  mongoose.model("CodebookVersion", codebookVersionSchema);

export class CodebookVersionService {
  private static toCodebookVersion(doc: any): CodebookVersion {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<CodebookVersion[]> {
    const match = options?.match || {};
    let query = CodebookVersionModel.find(match);

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
    return docs.map((doc) => this.toCodebookVersion(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return CodebookVersionModel.countDocuments(match);
  }

  static async findById(
    id: string | undefined,
  ): Promise<CodebookVersion | null> {
    if (!id) return null;
    const doc = await CodebookVersionModel.findById(id);
    return doc ? this.toCodebookVersion(doc) : null;
  }

  static async create(
    data: Partial<CodebookVersion>,
  ): Promise<CodebookVersion> {
    const doc = await CodebookVersionModel.create(data);
    return this.toCodebookVersion(doc);
  }

  static async updateById(
    id: string,
    updates: Partial<CodebookVersion>,
  ): Promise<CodebookVersion | null> {
    const doc = await CodebookVersionModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toCodebookVersion(doc) : null;
  }

  static async deleteById(id: string): Promise<CodebookVersion | null> {
    const doc = await CodebookVersionModel.findByIdAndDelete(id);
    return doc ? this.toCodebookVersion(doc) : null;
  }

  static async findOne(
    match: Record<string, any>,
  ): Promise<CodebookVersion | null> {
    const docs = await this.find({ match });
    return docs[0] || null;
  }

  static async createNextVersion(
    codebookId: string,
    fromVersion: CodebookVersion,
  ): Promise<CodebookVersion> {
    const newAttributes = pick(fromVersion, ["categories"]);

    const allVersions = await this.find({
      match: { codebook: codebookId },
    });

    return this.create({
      ...newAttributes,
      name: `${fromVersion.name.replace(/#\d+/g, "").trim()} #${allVersions.length + 1}`,
      codebook: codebookId,
      version: allVersions.length + 1,
    });
  }
}
