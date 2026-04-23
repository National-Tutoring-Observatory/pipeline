import { AuditService } from "~/modules/audits/audit";
import { BillingLedgerEntryService } from "../billingLedgerEntry";
import { TeamBillingBalanceService } from "../teamBillingBalance";

const MAX_RECONCILIATION_ATTEMPTS = 3;

export interface ReconcileTeamBillingBalanceResult {
  teamId: string;
  status: "already-aligned" | "repaired" | "retry-exhausted";
  expectedBalance: number;
  actualBalance: number;
  driftAmount: number;
  lastLedgerEntryAt: Date | null;
}

export default async function reconcileTeamBillingBalance(
  teamId: string,
): Promise<ReconcileTeamBillingBalanceResult> {
  for (let attempt = 0; attempt < MAX_RECONCILIATION_ATTEMPTS; attempt++) {
    const [snapshot, currentBalance] = await Promise.all([
      BillingLedgerEntryService.getBalanceSnapshotByTeam(teamId),
      TeamBillingBalanceService.findByTeam(teamId),
    ]);

    const actualBalance = currentBalance?.availableBalance ?? 0;
    const driftAmount = snapshot.expectedBalance - actualBalance;

    const totalsAligned =
      (currentBalance?.totalCredits ?? 0) === snapshot.creditTotal &&
      (currentBalance?.totalRawCosts ?? 0) === snapshot.rawCostTotal &&
      (currentBalance?.totalBilledCosts ?? 0) === snapshot.debitTotal;

    const isAligned =
      driftAmount === 0 &&
      totalsAligned &&
      (currentBalance !== null || snapshot.lastLedgerEntryAt === null);

    if (isAligned) {
      return {
        teamId,
        status: "already-aligned",
        expectedBalance: snapshot.expectedBalance,
        actualBalance,
        driftAmount,
        lastLedgerEntryAt: snapshot.lastLedgerEntryAt,
      };
    }

    const repairStatus = await TeamBillingBalanceService.reconcileToSnapshot({
      teamId,
      expectedBalance: snapshot.expectedBalance,
      lastLedgerEntryAt: snapshot.lastLedgerEntryAt,
      currentVersion: currentBalance?.version,
      runningTotals: {
        totalCredits: snapshot.creditTotal,
        totalRawCosts: snapshot.rawCostTotal,
        totalBilledCosts: snapshot.debitTotal,
      },
    });

    if (repairStatus === "updated") {
      await AuditService.createSystem({
        action: "RECONCILE_TEAM_BILLING_BALANCE",
        context: {
          teamId,
          previousBalance: actualBalance,
          expectedBalance: snapshot.expectedBalance,
          driftAmount,
          lastLedgerEntryAt: snapshot.lastLedgerEntryAt?.toISOString() ?? null,
        },
      });

      return {
        teamId,
        status: "repaired",
        expectedBalance: snapshot.expectedBalance,
        actualBalance,
        driftAmount,
        lastLedgerEntryAt: snapshot.lastLedgerEntryAt,
      };
    }
  }

  const [snapshot, currentBalance] = await Promise.all([
    BillingLedgerEntryService.getBalanceSnapshotByTeam(teamId),
    TeamBillingBalanceService.findByTeam(teamId),
  ]);

  const actualBalance = currentBalance?.availableBalance ?? 0;
  const driftAmount = snapshot.expectedBalance - actualBalance;

  console.error(
    `[reconcileTeamBillingBalance] Retry exhausted for team ${teamId}: expected=${snapshot.expectedBalance}, actual=${actualBalance}, drift=${driftAmount}`,
  );

  return {
    teamId,
    status: "retry-exhausted",
    expectedBalance: snapshot.expectedBalance,
    actualBalance,
    driftAmount,
    lastLedgerEntryAt: snapshot.lastLedgerEntryAt,
  };
}
