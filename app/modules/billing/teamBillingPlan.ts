import mongoose from "mongoose";
import teamBillingPlanSchema from "~/lib/schemas/teamBillingPlan.schema";
import type {
  BillingPlan,
  PendingPlanChange,
  TeamBillingPlan,
} from "./billing.types";
import { BillingPlanService } from "./billingPlan";
import { startOfMonth, startOfNextMonth } from "./helpers/periodDates";

const TeamBillingPlanModel =
  mongoose.models.TeamBillingPlan ||
  mongoose.model("TeamBillingPlan", teamBillingPlanSchema);

export class TeamBillingPlanService {
  private static toTeamBillingPlan(doc: mongoose.Document): TeamBillingPlan {
    return doc.toJSON({ flattenObjectIds: true }) as TeamBillingPlan;
  }

  private static async resolvePlan(
    assignment: TeamBillingPlan,
  ): Promise<BillingPlan | null> {
    const planId =
      typeof assignment.plan === "string"
        ? assignment.plan
        : assignment.plan._id;
    return BillingPlanService.findById(planId);
  }

  static async findByTeam(teamId: string): Promise<TeamBillingPlan | null> {
    const now = new Date();
    const doc = await TeamBillingPlanModel.findOne({
      team: teamId,
      effectiveFrom: { $lte: now },
    }).sort({ effectiveFrom: -1 });
    return doc ? this.toTeamBillingPlan(doc) : null;
  }

  static async assignPlan(
    teamId: string,
    planId: string,
  ): Promise<TeamBillingPlan> {
    const now = new Date();
    const hasActiveAssignment = await TeamBillingPlanModel.exists({
      team: teamId,
      effectiveFrom: { $lte: now },
    });

    const effectiveFrom = hasActiveAssignment
      ? startOfNextMonth(now)
      : startOfMonth(now);

    const doc = await TeamBillingPlanModel.findOneAndUpdate(
      { team: teamId, effectiveFrom },
      { $set: { plan: planId } },
      { upsert: true, new: true },
    );
    return this.toTeamBillingPlan(doc);
  }

  static async getEffectivePlan(
    teamId: string,
    asOf: Date = new Date(),
  ): Promise<BillingPlan | null> {
    const doc = await TeamBillingPlanModel.findOne({
      team: teamId,
      effectiveFrom: { $lte: asOf },
    }).sort({ effectiveFrom: -1 });

    if (!doc) return null;
    return this.resolvePlan(this.toTeamBillingPlan(doc));
  }

  static async findAllActiveTeamIds(
    asOf: Date = new Date(),
  ): Promise<string[]> {
    const ids = await TeamBillingPlanModel.distinct("team", {
      effectiveFrom: { $lte: asOf },
    });
    return ids.map((id: any) => id.toString());
  }

  static async findTeamsWithAnyPlan(): Promise<string[]> {
    const ids = await TeamBillingPlanModel.distinct("team");
    return ids.map((id: any) => id.toString());
  }

  static async getPendingPlanChange(
    teamId: string,
  ): Promise<PendingPlanChange | null> {
    const now = new Date();
    const doc = await TeamBillingPlanModel.findOne({
      team: teamId,
      effectiveFrom: { $gt: now },
    });

    if (!doc) return null;
    const assignment = this.toTeamBillingPlan(doc);
    const plan = await this.resolvePlan(assignment);
    if (!plan) return null;
    return { plan, effectiveFrom: assignment.effectiveFrom };
  }
}
