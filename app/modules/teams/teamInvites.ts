import mongoose from "mongoose";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import teamInviteSchema from "~/lib/schemas/teamInvite.schema";
import type { FindOptions, PaginateProps } from "~/modules/common/types";
import generateTeamInviteSlug from "./helpers/generateTeamInviteSlug";
import type { TeamInvite } from "./teamInvites.types";

const TeamInviteModel =
  mongoose.models.TeamInvite || mongoose.model("TeamInvite", teamInviteSchema);

export class TeamInviteService {
  private static toTeamInvite(doc: mongoose.Document): TeamInvite {
    return doc.toJSON({ flattenObjectIds: true }) as TeamInvite;
  }

  static async find(options?: FindOptions): Promise<TeamInvite[]> {
    const match = options?.match || {};
    let query = TeamInviteModel.find(match);
    if (options?.sort) query = query.sort(options.sort);
    if (options?.pagination) {
      query = query
        .skip(options.pagination.skip)
        .limit(options.pagination.limit);
    }
    const docs = await query.exec();
    return docs.map((doc) => this.toTeamInvite(doc));
  }

  static async count(match: Record<string, unknown> = {}): Promise<number> {
    return TeamInviteModel.countDocuments(match);
  }

  static async paginate({
    match,
    sort,
    page,
    pageSize,
  }: PaginateProps): Promise<{
    data: TeamInvite[];
    count: number;
    totalPages: number;
  }> {
    const pagination = getPaginationParams(page, pageSize);
    const results = await this.find({ match, sort, pagination });
    const count = await this.count(match);
    return {
      data: results,
      count,
      totalPages: getTotalPages(count, pageSize),
    };
  }

  static async findById(id: string | undefined): Promise<TeamInvite | null> {
    if (!id) return null;
    const doc = await TeamInviteModel.findById(id);
    return doc ? this.toTeamInvite(doc) : null;
  }

  static async findOne(
    query: Record<string, unknown>,
  ): Promise<TeamInvite | null> {
    const doc = await TeamInviteModel.findOne(query);
    return doc ? this.toTeamInvite(doc) : null;
  }

  static async create(data: {
    team: string;
    name: string;
    maxUses: number;
    createdBy: string;
  }): Promise<TeamInvite> {
    const payload = {
      team: data.team,
      name: data.name,
      maxUses: data.maxUses,
      createdBy: data.createdBy,
      role: "MEMBER",
      usedCount: 0,
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      const slug = generateTeamInviteSlug(data.name);
      try {
        const doc = await TeamInviteModel.create({ ...payload, slug });
        return this.toTeamInvite(doc);
      } catch (err: unknown) {
        const isDuplicate =
          typeof err === "object" &&
          err !== null &&
          (err as { code?: number }).code === 11000;
        if (!isDuplicate || attempt === 1) throw err;
      }
    }
    throw new Error("Failed to generate unique slug");
  }

  static async revokeById(
    id: string,
    userId: string,
  ): Promise<TeamInvite | null> {
    const doc = await TeamInviteModel.findByIdAndUpdate(
      id,
      {
        revokedAt: new Date(),
        revokedBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      { new: true },
    ).exec();
    return doc ? this.toTeamInvite(doc) : null;
  }
}
