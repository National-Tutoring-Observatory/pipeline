import mongoose from "mongoose";
import userSchema from "~/lib/schemas/user.schema";
import { AuditService } from "~/modules/audits/audit";
import type { FindOptions } from "~/modules/common/types";
import type { User } from "./users.types";

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export class UserService {
  private static toUser(doc: any): User {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async find(options?: FindOptions): Promise<User[]> {
    const match = options?.match || {};
    let query = UserModel.find(match);

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
    return docs.map((doc) => this.toUser(doc));
  }

  static async count(match: Record<string, any> = {}): Promise<number> {
    return UserModel.countDocuments(match);
  }

  static async findById(id: string | undefined): Promise<User | null> {
    if (!id) return null;
    const doc = await UserModel.findById(id);
    return doc ? this.toUser(doc) : null;
  }

  static async create(data: Partial<User>): Promise<User> {
    const doc = await UserModel.create(data);
    return this.toUser(doc);
  }

  static async updateById(
    id: string,
    updates: Partial<User>,
  ): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toUser(doc) : null;
  }

  static async deleteById(id: string): Promise<User | null> {
    const doc = await UserModel.findByIdAndDelete(id).exec();
    return doc ? this.toUser(doc) : null;
  }

  static async removeTeam(userId: string, teamId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { teams: { team: teamId } },
    });
  }

  static async addFeatureFlag(
    userId: string,
    featureFlagName: string,
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { featureFlags: featureFlagName },
    });
  }

  static async removeFeatureFlagFromUser(
    userId: string,
    featureFlagName: string,
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { featureFlags: featureFlagName },
    });
  }

  // TODO: Move this to the feature flag service later
  static async removeFeatureFlag(featureFlagName: string): Promise<void> {
    await UserModel.updateMany(
      { featureFlags: { $in: [featureFlagName] } },
      { $pull: { featureFlags: featureFlagName } },
    );
  }

  static async assignSuperAdminRole({
    targetUserId,
    performedByUserId,
    reason,
    performedByUsername,
  }: {
    targetUserId: string;
    performedByUserId: string;
    reason: string;
    performedByUsername: string;
  }): Promise<void> {
    await this.updateById(targetUserId, { role: "SUPER_ADMIN" });

    await AuditService.create({
      action: "ADD_SUPERADMIN",
      performedBy: performedByUserId,
      performedByUsername,
      context: { target: targetUserId, reason },
    });
  }

  static async revokeSuperAdminRole({
    targetUserId,
    performedByUserId,
    reason,
    performedByUsername,
  }: {
    targetUserId: string;
    performedByUserId: string;
    reason: string;
    performedByUsername: string;
  }): Promise<void> {
    await this.updateById(targetUserId, { role: "USER" });

    await AuditService.create({
      action: "REMOVE_SUPERADMIN",
      performedBy: performedByUserId,
      performedByUsername,
      context: { target: targetUserId, reason },
    });
  }
}
