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

    const isAligned =
      driftAmount === 0 &&
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

  return {
    teamId,
    status: "retry-exhausted",
    expectedBalance: snapshot.expectedBalance,
    actualBalance: currentBalance?.availableBalance ?? 0,
    driftAmount:
      snapshot.expectedBalance - (currentBalance?.availableBalance ?? 0),
    lastLedgerEntryAt: snapshot.lastLedgerEntryAt,
  };
}
