import type { Job } from "bullmq";
import { BillingLedgerEntryService } from "~/modules/billing/billingLedgerEntry";
import type { ReconcileTeamBillingBalanceResult } from "~/modules/billing/services/reconcileTeamBillingBalance.server";
import reconcileTeamBillingBalance from "~/modules/billing/services/reconcileTeamBillingBalance.server";
import { TeamBillingBalanceService } from "~/modules/billing/teamBillingBalance";
import { TeamBillingPlanService } from "~/modules/billing/teamBillingPlan";
import { NotificationService } from "~/modules/notifications/notification";
import mapWithConcurrency from "../helpers/mapWithConcurrency";

const DRIFT_ALERT_THRESHOLD = 0.01;

type ReconcileResult =
  | ReconcileTeamBillingBalanceResult
  | { teamId: string; status: "failed" };

function buildAlertMessage(results: ReconcileResult[]): string | null {
  const repaired = results.filter(
    (r): r is ReconcileTeamBillingBalanceResult =>
      r.status === "repaired" &&
      Math.abs(r.driftAmount) >= DRIFT_ALERT_THRESHOLD,
  );
  const exhausted = results.filter(
    (r): r is ReconcileTeamBillingBalanceResult =>
      r.status === "retry-exhausted",
  );

  if (repaired.length === 0 && exhausted.length === 0) return null;

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const lines: string[] = [":warning: *Billing Reconciliation Alert*"];

  if (repaired.length > 0) {
    lines.push(`\n*Repaired (${repaired.length}):*`);
    for (const r of repaired) {
      lines.push(
        `• Team \`${r.teamId}\`: drift ${fmt(r.driftAmount)} (expected ${fmt(r.expectedBalance)}, was ${fmt(r.actualBalance)})`,
      );
    }
  }

  if (exhausted.length > 0) {
    lines.push(
      `\n*:rotating_light: Retry Exhausted (${exhausted.length}) — needs human attention:*`,
    );
    for (const r of exhausted) {
      lines.push(
        `• Team \`${r.teamId}\`: drift ${fmt(r.driftAmount)} (expected ${fmt(r.expectedBalance)}, actual ${fmt(r.actualBalance)})`,
      );
    }
  }

  return lines.join("\n");
}

export default async function reconcileBillingBalances(_job: Job) {
  const [teamsWithPlan, ledgerTeamIds, balanceTeamIds] = await Promise.all([
    TeamBillingPlanService.findTeamsWithAnyPlan(),
    BillingLedgerEntryService.findAllTeamIds(),
    TeamBillingBalanceService.findAllTeamIds(),
  ]);

  const teamIds = [
    ...new Set([...teamsWithPlan, ...ledgerTeamIds, ...balanceTeamIds]),
  ];

  const results: ReconcileResult[] = await mapWithConcurrency(
    teamIds,
    async (teamId) => {
      try {
        return await reconcileTeamBillingBalance(teamId);
      } catch (error) {
        console.error(
          `[reconcileBillingBalances] Failed to reconcile team ${teamId}:`,
          error,
        );
        return { teamId, status: "failed" as const };
      }
    },
  );

  const repaired = results.filter(
    (result) => result.status === "repaired",
  ).length;
  const alreadyAligned = results.filter(
    (result) => result.status === "already-aligned",
  ).length;
  const retryExhausted = results.filter(
    (result) => result.status === "retry-exhausted",
  ).length;
  const failed = results.filter((result) => result.status === "failed").length;

  const alertMessage = buildAlertMessage(results);
  if (alertMessage) {
    try {
      await NotificationService.deliver(alertMessage);
    } catch (error) {
      console.error(
        "[reconcileBillingBalances] Failed to send Slack alert:",
        error,
      );
    }
  }

  return {
    status: failed > 0 || retryExhausted > 0 ? "PARTIAL" : "OK",
    message: `Reconciled ${teamIds.length} team(s): ${repaired} repaired, ${alreadyAligned} already aligned, ${retryExhausted} retry exhausted, ${failed} failed`,
    stats: {
      teams: teamIds.length,
      repaired,
      alreadyAligned,
      retryExhausted,
      failed,
    },
  };
}
