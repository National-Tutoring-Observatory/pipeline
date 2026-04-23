import Decimal from "decimal.js";
import withTransaction from "~/lib/withTransaction";
import { BillingLedgerEntryModel } from "../billingLedgerEntry";
import { TeamBillingBalanceService } from "../teamBillingBalance";
import { TeamBillingPlanService } from "../teamBillingPlan";

interface ApplyBillingDebitInput {
  teamId: string;
  model: string;
  source: string;
  sourceId?: string;
  createdAt?: Date;
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
  createdAt,
  inputTokens,
  outputTokens,
  rawAmount,
  providerCost,
  idempotencyKey,
  metadata,
}: ApplyBillingDebitInput): Promise<void> {
  if (rawAmount <= 0) throw new Error("Debit rawAmount must be positive");
  const entryCreatedAt = createdAt ?? new Date();

  const plan = await TeamBillingPlanService.getEffectivePlan(teamId);
  const markupRateApplied = plan?.markupRate ?? 1;
  const billedAmount = new Decimal(rawAmount)
    .times(markupRateApplied)
    .toNumber();

  try {
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
            model,
            inputTokens,
            outputTokens,
            providerCost,
            source,
            sourceId,
            idempotencyKey,
            metadata,
            createdAt: entryCreatedAt,
          },
        ],
        { session },
      );

      await TeamBillingBalanceService.applyDelta(
        teamId,
        -billedAmount,
        session,
        {
          totalRawCosts: rawAmount,
          totalBilledCosts: billedAmount,
        },
      );
    });
  } catch (error) {
    // Duplicate key means this idempotency key was already applied, so treat the
    // retry as a no-op instead of failing the request.
    if ((error as { code?: number }).code === 11000) {
      return;
    }

    throw error;
  }
}
