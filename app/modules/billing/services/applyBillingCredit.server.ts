import withTransaction from "~/lib/withTransaction";
import { BillingLedgerEntryModel } from "../billingLedgerEntry";
import {
  creditsAppliedCounter,
  idempotentSkipsCounter,
} from "../helpers/billingMetrics";
import { TeamBillingBalanceService } from "../teamBillingBalance";

interface ApplyBillingCreditInput {
  teamId: string;
  amount: number;
  addedBy: string;
  createdAt?: Date;
  note?: string;
  source: string;
  sourceId?: string;
  idempotencyKey: string;
  stripeSessionId?: string;
  metadata?: Record<string, unknown>;
}

export default async function applyBillingCredit({
  teamId,
  amount,
  addedBy,
  createdAt,
  note,
  source,
  sourceId,
  idempotencyKey,
  stripeSessionId,
  metadata,
}: ApplyBillingCreditInput): Promise<void> {
  if (amount <= 0) throw new Error("Credit amount must be positive");
  const entryCreatedAt = createdAt ?? new Date();

  try {
    await withTransaction(async (session) => {
      await BillingLedgerEntryModel.create(
        [
          {
            team: teamId,
            direction: "credit",
            amount,
            currency: "USD",
            source,
            sourceId,
            idempotencyKey,
            metadata: {
              ...metadata,
              addedBy,
              note,
              stripeSessionId,
            },
            createdAt: entryCreatedAt,
          },
        ],
        { session },
      );

      await TeamBillingBalanceService.applyDelta(teamId, amount, session, {
        totalCredits: amount,
      });
    });

    creditsAppliedCounter.add(amount, { team: teamId });
  } catch (error) {
    // Duplicate key means this idempotency key was already applied, so treat the
    // retry as a no-op instead of failing the request.
    if ((error as { code?: number }).code === 11000) {
      idempotentSkipsCounter.add(1, { direction: "credit", team: teamId });
      return;
    }

    throw error;
  }
}
