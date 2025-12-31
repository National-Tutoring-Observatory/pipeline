import mongoose from 'mongoose';
import userSchema from '~/modules/documents/schemas/user.schema';
import type { User } from './users.types';

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

export class UserService {
  private static toUser(doc: any): User {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async findById(id: string | undefined): Promise<User | null> {
    if (!id) return null;
    const doc = await UserModel.findById(id);
    return doc ? this.toUser(doc) : null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const doc = await UserModel.findOne({ username });
    return doc ? this.toUser(doc) : null;
  }

  static async findByGithubId(githubId: number): Promise<User | null> {
    const doc = await UserModel.findOne({ githubId });
    return doc ? this.toUser(doc) : null;
  }

  static async find(filter: Record<string, any> = {}): Promise<User[]> {
    const docs = await UserModel.find(filter);
    return docs.map((doc) => this.toUser(doc));
  }

  static async create(data: Partial<User>): Promise<User> {
    const doc = await UserModel.create(data);
    return this.toUser(doc);
  }

  static async updateById(id: string, updates: Partial<User>): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toUser(doc) : null;
  }

  static async deleteById(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  static async removeTeam(userId: string, teamId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { teams: { team: teamId } },
    });
  }

  static async addFeatureFlag(userId: string, featureFlagName: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { featureFlags: featureFlagName },
    });
  }

  static async removeFeatureFlagFromUser(userId: string, featureFlagName: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { featureFlags: featureFlagName },
    });
  }

  // TODO: Move this to the feature flag service later
  static async removeFeatureFlag(featureFlagName: string): Promise<void> {
    await UserModel.updateMany(
      { featureFlags: { $in: [featureFlagName] } },
      { $pull: { featureFlags: featureFlagName } }
    );
  }
}
