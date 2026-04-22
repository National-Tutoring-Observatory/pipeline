import type { BalanceSummary, BillingPeriodReport } from "../billing.types";
import { BillingLedgerEntryService } from "../billingLedgerEntry";
import { TeamBillingBalanceService } from "../teamBillingBalance";
import { TeamBillingPlanService } from "../teamBillingPlan";

export interface BillingReportingSummary {
  balanceSummary: BalanceSummary | null;
  closedPeriods: BillingPeriodReport[];
}

function getPeriodStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function getPeriodEnd(startAt: Date) {
  return new Date(
    Date.UTC(startAt.getUTCFullYear(), startAt.getUTCMonth() + 1, 1),
  );
}

function getPeriodKey(date: Date) {
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}`;
}

export default async function getBillingReportingSummary(
  teamId: string,
): Promise<BillingReportingSummary> {
  const [plan, billingBalance, ledger] = await Promise.all([
    TeamBillingPlanService.getEffectivePlan(teamId),
    TeamBillingBalanceService.findByTeam(teamId),
    BillingLedgerEntryService.findByTeam(teamId),
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

  const periodsMap = new Map<
    string,
    {
      startAt: Date;
      endAt: Date;
      rawCost: number;
      billedAmount: number;
      closedAt: Date;
    }
  >();

  for (const entry of debitEntries) {
    const createdAt = new Date(entry.createdAt);
    const startAt = getPeriodStart(createdAt);
    const key = getPeriodKey(startAt);
    const current = periodsMap.get(key) ?? {
      startAt,
      endAt: getPeriodEnd(startAt),
      rawCost: 0,
      billedAmount: 0,
      closedAt: createdAt,
    };

    current.rawCost += entry.rawAmount ?? 0;
    current.billedAmount += entry.billedAmount ?? entry.amount;
    if (createdAt > current.closedAt) {
      current.closedAt = createdAt;
    }

    periodsMap.set(key, current);
  }

  const closedPeriods = Array.from(periodsMap.values())
    .sort((a, b) => b.startAt.getTime() - a.startAt.getTime())
    .map((period, index, periods) => {
      const newerPeriods = periods.slice(0, index).reverse();
      const newerBilledAmount = newerPeriods.reduce(
        (sum, current) => sum + current.billedAmount,
        0,
      );

      return {
        _id: `${teamId}:${getPeriodKey(period.startAt)}`,
        team: teamId,
        startAt: period.startAt,
        endAt: period.endAt,
        rawCost: period.rawCost,
        billedAmount: period.billedAmount,
        closingBalance:
          (billingBalance?.availableBalance ?? 0) + newerBilledAmount,
        closedAt: period.closedAt,
      } satisfies BillingPeriodReport;
    });

  return {
    balanceSummary: {
      balance: billingBalance?.availableBalance ?? 0,
      credits,
      costs,
      markedUpCosts,
      plan,
    },
    closedPeriods,
  };
}
