import type { BalanceSummary, BillingPeriodReport } from "../billing.types";
import { BillingPeriodService } from "../billingPeriod";
import { TeamBillingService } from "../teamBilling";

export interface BillingReportingSummary {
  balanceSummary: BalanceSummary | null;
  closedPeriods: BillingPeriodReport[];
}

export default async function getBillingReportingSummary(
  teamId: string,
): Promise<BillingReportingSummary> {
  const [balanceSummary, closedPeriods] = await Promise.all([
    TeamBillingService.getBalanceSummary(teamId),
    BillingPeriodService.findClosedByTeam(teamId),
  ]);

  return {
    balanceSummary,
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
