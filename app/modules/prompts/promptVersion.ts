import pick from 'lodash/pick';
import mongoose from 'mongoose';
import promptVersionSchema from '~/modules/documents/schemas/promptVersion.schema';
import type { PromptVersion } from './prompts.types';
import type { FindOptions } from '~/modules/common/types';

const PromptVersionModel = mongoose.model('PromptVersion', promptVersionSchema);

export class PromptVersionService {
  private static toPromptVersion(doc: any): PromptVersion {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<PromptVersion[]> {
    const match = options?.match || {};
    let query = PromptVersionModel.find(match);

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
    return docs.map(doc => this.toPromptVersion(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return PromptVersionModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<PromptVersion | null> {
    if (!id) return null;
    const doc = await PromptVersionModel.findById(id);
    return doc ? this.toPromptVersion(doc) : null;
  }

  static async create(data: Partial<PromptVersion>): Promise<PromptVersion> {
    const doc = await PromptVersionModel.create(data);
    return this.toPromptVersion(doc);
  }

  static async updateById(id: string, updates: Partial<PromptVersion>): Promise<PromptVersion | null> {
    const doc = await PromptVersionModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toPromptVersion(doc) : null;
  }

  static async deleteById(id: string): Promise<PromptVersion | null> {
    const doc = await PromptVersionModel.findByIdAndDelete(id);
    return doc ? this.toPromptVersion(doc) : null;
  }

  static async findOne(match: Record<string, any>): Promise<PromptVersion | null> {
    const docs = await this.find({ match });
    return docs[0] || null;
  }

  static async createNextVersion(promptId: string, fromVersion: PromptVersion): Promise<PromptVersion> {
    const newPromptAttributes = pick(fromVersion, ['userPrompt', 'annotationSchema']);

    const allVersions = await this.find({
      match: { prompt: promptId }
    });

    return this.create({
      ...newPromptAttributes,
      name: `${fromVersion.name.replace(/#\d+/g, '').trim()} #${allVersions.length + 1}`,
      prompt: promptId,
      version: allVersions.length + 1
    });
  }
}
