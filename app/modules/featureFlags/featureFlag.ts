import mongoose from 'mongoose';
import featureFlagSchema from '~/lib/schemas/featureFlag.schema';
import type { FeatureFlag } from './featureFlags.types';
import type { FindOptions } from '~/modules/common/types';

const FeatureFlagModel = mongoose.model('FeatureFlag', featureFlagSchema);

export class FeatureFlagService {
  private static toFeatureFlag(doc: any): FeatureFlag {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<FeatureFlag[]> {
    const match = options?.match || {};
    let query = FeatureFlagModel.find(match);

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
    return docs.map(doc => this.toFeatureFlag(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return FeatureFlagModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<FeatureFlag | null> {
    if (!id) return null;
    const doc = await FeatureFlagModel.findById(id);
    return doc ? this.toFeatureFlag(doc) : null;
  }

  static async create(data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const doc = await FeatureFlagModel.create(data);
    return this.toFeatureFlag(doc);
  }

  static async updateById(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
    const doc = await FeatureFlagModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toFeatureFlag(doc) : null;
  }

  static async deleteById(id: string): Promise<FeatureFlag | null> {
    const doc = await FeatureFlagModel.findByIdAndDelete(id);
    return doc ? this.toFeatureFlag(doc) : null;
  }
}
