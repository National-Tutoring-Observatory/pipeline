import type { BalanceSummary } from "./billing.types";
import { BillingLedgerEntryService } from "./billingLedgerEntry";
import { BillingPlanService } from "./billingPlan";
import getInitialCreditsAmount from "./helpers/getInitialCreditsAmount.server";
import addCredits, {
  type AddCreditsResult,
} from "./services/addCredits.server";
import applyBillingCredit from "./services/applyBillingCredit.server";
import applyBillingDebit from "./services/applyBillingDebit.server";
import getBillingReportingSummary, {
  type BillingReportingSummary,
} from "./services/getBillingReportingSummary.server";
import { TeamBillingBalanceService } from "./teamBillingBalance";
import { TeamBillingPlanService } from "./teamBillingPlan";

export class TeamBillingService {
  static async getBalanceSummary(
    teamId: string,
  ): Promise<BalanceSummary | null> {
    const [plan, billingBalance, ledgerEntries] = await Promise.all([
      TeamBillingPlanService.getEffectivePlan(teamId),
      TeamBillingBalanceService.findByTeam(teamId),
      BillingLedgerEntryService.findByTeam(teamId),
    ]);

    if (!plan) return null;

    const credits = ledgerEntries
      .filter((entry) => entry.direction === "credit")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const debitEntries = ledgerEntries.filter(
      (entry) => entry.direction === "debit",
    );
    const costs = debitEntries.reduce(
      (sum, entry) => sum + (entry.rawAmount ?? 0),
      0,
    );
    const markedUpCosts = debitEntries.reduce(
      (sum, entry) => sum + (entry.billedAmount ?? entry.amount),
      0,
    );

    return {
      balance: billingBalance?.availableBalance ?? 0,
      credits,
      costs,
      markedUpCosts,
      plan,
    };
  }

  static async getBalance(teamId: string): Promise<number> {
    const billingBalance = await TeamBillingBalanceService.findByTeam(teamId);
    return billingBalance?.availableBalance ?? 0;
  }

  static async getReportingSummary(
    teamId: string,
  ): Promise<BillingReportingSummary> {
    return getBillingReportingSummary(teamId);
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

  static async addCredits(input: {
    teamId: string;
    amount: number;
    note?: string;
    addedBy: string;
    idempotencyKey: string;
  }): Promise<AddCreditsResult> {
    return addCredits(input);
  }

  static async applyCredit(input: {
    teamId: string;
    amount: number;
    addedBy: string;
    createdAt?: Date;
    note?: string;
    source: string;
    sourceId?: string;
    idempotencyKey: string;
    stripeSessionId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await applyBillingCredit(input);
  }

  static async applyDebit(input: {
    teamId: string;
    model: string;
    source: string;
    sourceId?: string;
    createdAt?: Date;
    inputTokens: number;
    outputTokens: number;
    rawAmount: number;
    providerCost: number;
    idempotencyKey: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await applyBillingDebit(input);
  }

  static async applyStripeTopUp({
    teamId,
    userId,
    amount,
    stripeSessionId,
    paymentStatus,
  }: {
    teamId: string;
    userId: string;
    amount: number;
    stripeSessionId: string;
    paymentStatus: string;
  }): Promise<void> {
    await applyBillingCredit({
      teamId,
      amount,
      addedBy: userId,
      note: "Purchased via Stripe",
      stripeSessionId,
      source: "stripe-topup",
      sourceId: stripeSessionId,
      idempotencyKey: `stripe-checkout:${stripeSessionId}`,
      metadata: {
        paymentStatus,
      },
    });
  }
}
