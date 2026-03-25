import Decimal from "decimal.js";
import { LlmCostService } from "~/modules/llmCosts/llmCost";
import type { BalanceSummary } from "./billing.types";
import { BillingPlanService } from "./billingPlan";
import { TeamBillingPlanService } from "./teamBillingPlan";
import { TeamCreditService } from "./teamCredit";

export class TeamBillingService {
  static async getBalanceSummary(
    teamId: string,
  ): Promise<BalanceSummary | null> {
    const [credits, costs, assignment] = await Promise.all([
      TeamCreditService.sumByTeam(teamId),
      LlmCostService.sumCostByTeam(teamId),
      TeamBillingPlanService.findByTeam(teamId),
    ]);

    if (!assignment) return null;

    const planId =
      typeof assignment.plan === "string"
        ? assignment.plan
        : assignment.plan._id;
    const plan = await BillingPlanService.findById(planId);
    if (!plan) return null;

    const markedUpCosts = new Decimal(costs).times(plan.markupRate).toNumber();
    const balance = new Decimal(credits).minus(markedUpCosts).toNumber();

    return { balance, credits, costs, markedUpCosts, plan };
  }

  static async getBalance(teamId: string): Promise<number> {
    const summary = await this.getBalanceSummary(teamId);
    return summary?.balance ?? 0;
  }
}
