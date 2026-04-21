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
    const [legacySummary, billingBalance] = await Promise.all([
      getLegacyBalanceSummary(teamId),
      TeamBillingBalanceService.findByTeam(teamId),
    ]);

    if (!legacySummary) return null;
    if (!billingBalance) return legacySummary;

    return {
      ...legacySummary,
      balance: billingBalance.availableBalance,
    };
  }

  static async getBalance(teamId: string): Promise<number> {
    const billingBalance = await TeamBillingBalanceService.findByTeam(teamId);
    if (billingBalance) {
      return billingBalance.availableBalance;
    }

    const summary = await getLegacyBalanceSummary(teamId);
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
