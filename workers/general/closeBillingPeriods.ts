import { BillingPeriodService } from "app/modules/billing/billingPeriod";
import { BillingPlanService } from "app/modules/billing/billingPlan";
import { TeamBillingPlanService } from "app/modules/billing/teamBillingPlan";
import { TeamService } from "app/modules/teams/team";
import type { Job } from "bullmq";

export default async function closeBillingPeriods(_job: Job) {
  const now = new Date();

  // 1. Close stale open periods in parallel
  const stale = await BillingPeriodService.findStaleOpenPeriods(now);

  // Warn if any team has more than one stale period — costs in skipped months may be unbilled
  const staleCountByTeam = new Map<string, number>();
  for (const p of stale) {
    staleCountByTeam.set(p.team, (staleCountByTeam.get(p.team) ?? 0) + 1);
  }
  for (const [tid, count] of staleCountByTeam) {
    if (count > 1) {
      console.warn(
        `[closeBillingPeriods] Team ${tid} has ${count} stale periods — costs in skipped months may not be billed`,
      );
    }
  }

  let closed = 0;
  let closeFailed = 0;
  for (const period of stale) {
    try {
      await BillingPeriodService.closePeriod(period);
      console.log(
        `[closeBillingPeriods] Closed period ${period._id} for team ${period.team} (endAt: ${new Date(period.endAt).toISOString()})`,
      );
      closed++;
    } catch (error) {
      closeFailed++;
      console.error(`[closeBillingPeriods] Failed to close a period:`, error);
    }
  }

  // 2. Open current-month period for all teams with an active plan.
  //    Track only genuinely new opens (not teams that already had a current period).
  const activeTeamIds = await TeamBillingPlanService.findAllActiveTeamIds(now);
  const openResults = await Promise.all(
    activeTeamIds.map(async (teamId) => {
      const hadCurrent = await BillingPeriodService.getCurrentPeriod(teamId);
      if (hadCurrent) return false;
      const period = await BillingPeriodService.findOrOpenCurrentPeriod(
        teamId,
        now,
      );
      return period !== null;
    }),
  );
  const opened = openResults.filter(Boolean).length;

  // 3. Assign default plan to any team that has none (recovery fallback)
  const allTeamIds = await TeamService.findAllIds();
  const teamsWithPlan = new Set(
    await TeamBillingPlanService.findTeamsWithAnyPlan(),
  );
  const planlessTeamIds = allTeamIds.filter((id) => !teamsWithPlan.has(id));
  let assigned = 0;

  if (planlessTeamIds.length > 0) {
    const defaultPlan = await BillingPlanService.findDefault();
    if (defaultPlan) {
      await Promise.all(
        planlessTeamIds.map(async (teamId) => {
          await TeamBillingPlanService.assignPlan(teamId, defaultPlan._id);
          console.log(
            `[closeBillingPeriods] Assigned default plan to planless team ${teamId}`,
          );
          assigned++;
        }),
      );
    } else {
      console.warn(
        `[closeBillingPeriods] ${planlessTeamIds.length} planless team(s) found but no default plan exists`,
      );
    }
  }

  console.log(
    `[closeBillingPeriods] Done: closed=${closed} opened=${opened} assigned=${assigned} closeFailed=${closeFailed}`,
  );

  return {
    status: closeFailed > 0 ? "PARTIAL" : "OK",
    message: `Closed ${closed} periods, opened ${opened} new periods, assigned plan to ${assigned} planless teams${closeFailed > 0 ? `, ${closeFailed} failed to close` : ""}`,
    stats: { closed, closeFailed, opened, assigned },
  };
}
