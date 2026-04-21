import Decimal from "decimal.js";
import { LlmCostService } from "~/modules/llmCosts/llmCost";
import type { BalanceSummary } from "../billing.types";
import { BillingPeriodService } from "../billingPeriod";
import { TeamBillingPlanService } from "../teamBillingPlan";
import { TeamCreditService } from "../teamCredit";

export default async function getLegacyBalanceSummary(
  teamId: string,
): Promise<BalanceSummary | null> {
  const [plan, lastClosed] = await Promise.all([
    TeamBillingPlanService.getEffectivePlan(teamId),
    BillingPeriodService.getLastClosedPeriod(teamId),
  ]);
  if (!plan) return null;

  let credits: number;
  let costs: number;

  if (lastClosed) {
    const since = new Date(lastClosed.endAt);
    [credits, costs] = await Promise.all([
      TeamCreditService.sumByTeamSince(teamId, since),
      LlmCostService.sumCostByTeamSince(teamId, since),
    ]);
    const base = lastClosed.closingBalance ?? 0;
    const markedUpCosts = new Decimal(costs).times(plan.markupRate).toNumber();
    const balance = new Decimal(base)
      .plus(credits)
      .minus(markedUpCosts)
      .toNumber();

    return { balance, credits: base + credits, costs, markedUpCosts, plan };
  }

  [credits, costs] = await Promise.all([
    TeamCreditService.sumByTeam(teamId),
    LlmCostService.sumCostByTeam(teamId),
  ]);

  const markedUpCosts = new Decimal(costs).times(plan.markupRate).toNumber();
  const balance = new Decimal(credits).minus(markedUpCosts).toNumber();

  return { balance, credits, costs, markedUpCosts, plan };
}
