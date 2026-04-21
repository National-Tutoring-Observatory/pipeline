import Decimal from "decimal.js";
import mongoose from "mongoose";
import billingLedgerEntrySchema from "~/lib/schemas/billingLedgerEntry.schema";
import llmCostSchema from "~/lib/schemas/llmCost.schema";
import withTransaction from "~/lib/withTransaction";
import { TeamBillingBalanceService } from "../teamBillingBalance";
import { TeamBillingPlanService } from "../teamBillingPlan";

const BillingLedgerEntryModel =
  mongoose.models.BillingLedgerEntry ||
  mongoose.model("BillingLedgerEntry", billingLedgerEntrySchema);

const LlmCostModel =
  mongoose.models.LlmCost || mongoose.model("LlmCost", llmCostSchema);

interface ApplyBillingDebitInput {
  teamId: string;
  model: string;
  source: string;
  sourceId?: string;
  inputTokens: number;
  outputTokens: number;
  rawAmount: number;
  providerCost: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export default async function applyBillingDebit({
  teamId,
  model,
  source,
  sourceId,
  inputTokens,
  outputTokens,
  rawAmount,
  providerCost,
  idempotencyKey,
  metadata,
}: ApplyBillingDebitInput): Promise<void> {
  await TeamBillingBalanceService.ensureInitialized(teamId);

  const plan = await TeamBillingPlanService.getEffectivePlan(teamId);
  const markupRateApplied = plan?.markupRate ?? 1;
  const billedAmount = new Decimal(rawAmount)
    .times(markupRateApplied)
    .toNumber();

  await withTransaction(async (session) => {
    await BillingLedgerEntryModel.create(
      [
        {
          team: teamId,
          direction: "debit",
          amount: billedAmount,
          currency: "USD",
          rawAmount,
          markupRateApplied,
          billedAmount,
          source,
          sourceId,
          idempotencyKey,
          metadata,
        },
      ],
      { session },
    );

    await LlmCostModel.create(
      [
        {
          team: teamId,
          model,
          source,
          sourceId,
          inputTokens,
          outputTokens,
          cost: rawAmount,
          providerCost,
        },
      ],
      { session },
    );

    await TeamBillingBalanceService.applyDelta(teamId, -billedAmount, session);
  });
}
