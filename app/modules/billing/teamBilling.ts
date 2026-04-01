import Decimal from "decimal.js";
import { LlmCostService } from "~/modules/llmCosts/llmCost";
import type { BalanceSummary } from "./billing.types";
import { BillingPeriodService } from "./billingPeriod";
import { BillingPlanService } from "./billingPlan";
import isBillingEnabled from "./helpers/isBillingEnabled.server";
import { TeamBillingPlanService } from "./teamBillingPlan";
import { TeamCreditService } from "./teamCredit";

export class TeamBillingService {
  static async getBalanceSummary(
    teamId: string,
  ): Promise<BalanceSummary | null> {
    const [plan, lastClosed] = await Promise.all([
      TeamBillingPlanService.getEffectivePlan(teamId),
      BillingPeriodService.getLastClosedPeriod(teamId),
    ]);
    if (!plan) return null;

    let credits: number;
    let costs: number;

    if (lastClosed) {
      const since = new Date(lastClosed.endAt);
      [credits, costs] = await Promise.all([
        TeamCreditService.sumByTeamSince(teamId, since),
        LlmCostService.sumCostByTeamSince(teamId, since),
      ]);
      const base = lastClosed.closingBalance ?? 0;
      const markedUpCosts = new Decimal(costs)
        .times(plan.markupRate)
        .toNumber();
      const balance = new Decimal(base)
        .plus(credits)
        .minus(markedUpCosts)
        .toNumber();

      return { balance, credits: base + credits, costs, markedUpCosts, plan };
    }

    // No closed periods yet — fall back to all-time aggregation
    [credits, costs] = await Promise.all([
      TeamCreditService.sumByTeam(teamId),
      LlmCostService.sumCostByTeam(teamId),
    ]);

    const markedUpCosts = new Decimal(costs).times(plan.markupRate).toNumber();
    const balance = new Decimal(credits).minus(markedUpCosts).toNumber();

    return { balance, credits, costs, markedUpCosts, plan };
  }

  static async getBalance(teamId: string): Promise<number> {
    const summary = await this.getBalanceSummary(teamId);
    return summary?.balance ?? 0;
  }

  static async setupTeamBilling(teamId: string): Promise<void> {
    const defaultPlan = await BillingPlanService.findDefault();
    if (!defaultPlan) {
      console.warn(
        `No default billing plan found, skipping billing setup for team ${teamId}`,
      );
      return;
    }
    await TeamBillingPlanService.assignPlan(teamId, defaultPlan._id);
  }

  static async assignInitialCredits(
    teamId: string,
    userId: string,
  ): Promise<void> {
    const initialCredits = isBillingEnabled() ? 10 : 20;
    await TeamCreditService.create({
      team: teamId,
      amount: initialCredits,
      addedBy: userId,
      note: "Initial credits",
    });
  }
}
