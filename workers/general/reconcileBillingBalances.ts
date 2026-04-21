import type { Job } from "bullmq";
import { BillingLedgerEntryService } from "~/modules/billing/billingLedgerEntry";
import reconcileTeamBillingBalance from "~/modules/billing/services/reconcileTeamBillingBalance.server";
import { TeamBillingBalanceService } from "~/modules/billing/teamBillingBalance";
import { TeamBillingPlanService } from "~/modules/billing/teamBillingPlan";

const CONCURRENCY = 10;

async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  for (let index = 0; index < items.length; index += CONCURRENCY) {
    const batch = await Promise.all(
      items.slice(index, index + CONCURRENCY).map(fn),
    );
    results.push(...batch);
  }

  return results;
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

  const results = await mapWithConcurrency(teamIds, async (teamId) => {
    try {
      return await reconcileTeamBillingBalance(teamId);
    } catch (error) {
      console.error(
        `[reconcileBillingBalances] Failed to reconcile team ${teamId}:`,
        error,
      );
      return { teamId, status: "failed" as const };
    }
  });

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
