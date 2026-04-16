import mongoose from "mongoose";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import teamCreditSchema from "~/lib/schemas/teamCredit.schema";
import type { FindOptions, PaginateProps } from "~/modules/common/types";
import type { TeamCredit } from "./billing.types";

const TeamCreditModel =
  mongoose.models.TeamCredit || mongoose.model("TeamCredit", teamCreditSchema);

export class TeamCreditService {
  private static toTeamCredit(doc: mongoose.Document): TeamCredit {
    return doc.toJSON({ flattenObjectIds: true }) as TeamCredit;
  }

  static async find(options?: FindOptions): Promise<TeamCredit[]> {
    const match = options?.match || {};
    let query = TeamCreditModel.find(match);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.populate?.length) {
      query = query.populate(options.populate);
    }

    if (options?.pagination) {
      query = query
        .skip(options.pagination.skip)
        .limit(options.pagination.limit);
    }

    const docs = await query;
    return docs.map((doc) => this.toTeamCredit(doc));
  }

  static async count(match: Record<string, unknown> = {}): Promise<number> {
    return TeamCreditModel.countDocuments(match);
  }

  static async create(
    data: Omit<TeamCredit, "_id" | "createdAt">,
  ): Promise<TeamCredit> {
    const doc = await TeamCreditModel.create(data);
    return this.toTeamCredit(doc);
  }

  static async findByStripeSession(
    sessionId: string,
  ): Promise<TeamCredit | null> {
    const doc = await TeamCreditModel.findOne({ stripeSessionId: sessionId });
    return doc ? this.toTeamCredit(doc) : null;
  }

  static async findByTeam(teamId: string): Promise<TeamCredit[]> {
    const docs = await TeamCreditModel.find({ team: teamId }).sort({
      createdAt: -1,
    });
    return docs.map((doc) => this.toTeamCredit(doc));
  }

  static async sumByTeam(teamId: string): Promise<number> {
    const result = await TeamCreditModel.aggregate([
      { $match: { team: new mongoose.Types.ObjectId(teamId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  static async sumByTeamSince(teamId: string, since: Date): Promise<number> {
    const result = await TeamCreditModel.aggregate([
      {
        $match: {
          team: new mongoose.Types.ObjectId(teamId),
          createdAt: { $gte: since },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total ?? 0;
  }

  static async paginate({
    match,
    sort,
    page,
    pageSize,
  }: PaginateProps): Promise<{
    data: TeamCredit[];
    count: number;
    totalPages: number;
  }> {
    const pagination = getPaginationParams(page, pageSize);

    const results = await this.find({
      match,
      sort,
      pagination,
    });

    const count = await this.count(match);

    return {
      data: results,
      count,
      totalPages: getTotalPages(count, pageSize),
    };
  }
}
