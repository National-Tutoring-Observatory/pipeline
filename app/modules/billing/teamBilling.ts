import type { BalanceSummary } from "./billing.types";
import { BillingPlanService } from "./billingPlan";
import getInitialCreditsAmount from "./helpers/getInitialCreditsAmount.server";
import getLegacyBalanceSummary from "./helpers/getLegacyBalanceSummary.server";
import applyBillingCredit from "./services/applyBillingCredit.server";
import { TeamBillingBalanceService } from "./teamBillingBalance";
import { TeamBillingPlanService } from "./teamBillingPlan";

export class TeamBillingService {
  static async getBalanceSummary(
    teamId: string,
  ): Promise<BalanceSummary | null> {
    const [plan, legacySummary, billingBalance] = await Promise.all([
      TeamBillingPlanService.getEffectivePlan(teamId),
      getLegacyBalanceSummary(teamId),
      TeamBillingBalanceService.findByTeam(teamId),
    ]);

    if (!plan) return null;

    return {
      balance: billingBalance?.availableBalance ?? 0,
      credits: legacySummary?.credits ?? 0,
      costs: legacySummary?.costs ?? 0,
      markedUpCosts: legacySummary?.markedUpCosts ?? 0,
      plan,
    };
  }

  static async getBalance(teamId: string): Promise<number> {
    const billingBalance = await TeamBillingBalanceService.findByTeam(teamId);
    return billingBalance?.availableBalance ?? 0;
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
    await TeamBillingBalanceService.ensureInitialized(teamId, 0);
  }

  static async assignInitialCredits(
    teamId: string,
    userId: string,
  ): Promise<void> {
    const initialCredits = getInitialCreditsAmount();
    await applyBillingCredit({
      teamId,
      amount: initialCredits,
      addedBy: userId,
      note: "Initial credits",
      source: "initial-credit",
      idempotencyKey: `initial-credit:${teamId}`,
    });
  }
}
