import mongoose from 'mongoose';
import promptSchema from '~/lib/schemas/prompt.schema';
import type { Prompt } from './prompts.types';
import type { FindOptions } from '~/modules/common/types';

const PromptModel = mongoose.model('Prompt', promptSchema);

export class PromptService {
  private static toPrompt(doc: any): Prompt {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<Prompt[]> {
    const match = options?.match || {};
    let query = PromptModel.find(match);

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
    return docs.map(doc => this.toPrompt(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return PromptModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<Prompt | null> {
    if (!id) return null;
    const doc = await PromptModel.findById(id);
    return doc ? this.toPrompt(doc) : null;
  }

  static async create(data: Partial<Prompt>): Promise<Prompt> {
    const doc = await PromptModel.create(data);
    return this.toPrompt(doc);
  }

  static async updateById(id: string, updates: Partial<Prompt>): Promise<Prompt | null> {
    const doc = await PromptModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toPrompt(doc) : null;
  }

  static async deleteById(id: string): Promise<Prompt | null> {
    const doc = await PromptModel.findByIdAndDelete(id);
    return doc ? this.toPrompt(doc) : null;
  }
}
