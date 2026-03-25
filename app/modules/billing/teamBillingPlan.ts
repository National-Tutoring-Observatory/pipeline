import mongoose from "mongoose";
import teamBillingPlanSchema from "~/lib/schemas/teamBillingPlan.schema";
import type { BillingPlan, TeamBillingPlan } from "./billing.types";
import { BillingPlanService } from "./billingPlan";

const TeamBillingPlanModel =
  mongoose.models.TeamBillingPlan ||
  mongoose.model("TeamBillingPlan", teamBillingPlanSchema);

export class TeamBillingPlanService {
  private static toTeamBillingPlan(doc: any): TeamBillingPlan {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async findByTeam(teamId: string): Promise<TeamBillingPlan | null> {
    const doc = await TeamBillingPlanModel.findOne({ team: teamId });
    return doc ? this.toTeamBillingPlan(doc) : null;
  }

  static async assignPlan(
    teamId: string,
    planId: string,
  ): Promise<TeamBillingPlan> {
    const doc = await TeamBillingPlanModel.findOneAndUpdate(
      { team: teamId },
      { team: teamId, plan: planId },
      { upsert: true, new: true },
    );
    return this.toTeamBillingPlan(doc);
  }

  static async getEffectivePlan(teamId: string): Promise<BillingPlan | null> {
    const assignment = await this.findByTeam(teamId);
    if (!assignment) return null;

    const planId =
      typeof assignment.plan === "string"
        ? assignment.plan
        : assignment.plan._id;
    return BillingPlanService.findById(planId);
  }
}
