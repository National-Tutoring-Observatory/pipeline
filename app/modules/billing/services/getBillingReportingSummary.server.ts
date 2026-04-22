import type { BalanceSummary, BillingPeriodReport } from "../billing.types";
import { BillingLedgerEntryService } from "../billingLedgerEntry";
import { BillingPeriodService } from "../billingPeriod";
import { TeamBillingBalanceService } from "../teamBillingBalance";
import { TeamBillingPlanService } from "../teamBillingPlan";

export interface BillingReportingSummary {
  balanceSummary: BalanceSummary | null;
  closedPeriods: BillingPeriodReport[];
}

export default async function getBillingReportingSummary(
  teamId: string,
): Promise<BillingReportingSummary> {
  const [plan, billingBalance, ledger, closedPeriods] = await Promise.all([
    TeamBillingPlanService.getEffectivePlan(teamId),
    TeamBillingBalanceService.findByTeam(teamId),
    BillingLedgerEntryService.findByTeam(teamId),
    BillingPeriodService.findClosedByTeam(teamId),
  ]);

  if (!plan) {
    return { balanceSummary: null, closedPeriods: [] };
  }

  const credits = ledger
    .filter((entry) => entry.direction === "credit")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const debitEntries = ledger.filter((entry) => entry.direction === "debit");
  const costs = debitEntries.reduce(
    (sum, entry) => sum + (entry.rawAmount ?? 0),
    0,
  );
  const markedUpCosts = debitEntries.reduce(
    (sum, entry) => sum + (entry.billedAmount ?? entry.amount),
    0,
  );

  return {
    balanceSummary: {
      balance: billingBalance?.availableBalance ?? 0,
      credits,
      costs,
      markedUpCosts,
      plan,
    },
    closedPeriods: closedPeriods.map(
      (period) =>
        ({
          _id: period._id,
          team: period.team,
          startAt: period.startAt,
          endAt: period.endAt,
          openingBalance: period.openingBalance ?? 0,
          creditsAdded: period.creditsAdded ?? 0,
          rawCost: period.rawCost ?? 0,
          billedAmount: period.billedAmount ?? 0,
          closingBalance: period.closingBalance ?? 0,
          closedAt: period.closedAt ?? period.endAt,
        }) satisfies BillingPeriodReport,
    ),
  };
}
