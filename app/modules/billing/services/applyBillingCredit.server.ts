import mongoose from "mongoose";
import billingLedgerEntrySchema from "~/lib/schemas/billingLedgerEntry.schema";
import teamCreditSchema from "~/lib/schemas/teamCredit.schema";
import withTransaction from "~/lib/withTransaction";
import { TeamBillingBalanceService } from "../teamBillingBalance";

const BillingLedgerEntryModel =
  mongoose.models.BillingLedgerEntry ||
  mongoose.model("BillingLedgerEntry", billingLedgerEntrySchema);

const TeamCreditModel =
  mongoose.models.TeamCredit || mongoose.model("TeamCredit", teamCreditSchema);

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
  await TeamBillingBalanceService.ensureInitialized(teamId);
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
            metadata,
            createdAt: entryCreatedAt,
          },
        ],
        { session },
      );

      await TeamCreditModel.create(
        [
          {
            team: teamId,
            amount,
            addedBy,
            note,
            stripeSessionId,
            createdAt: entryCreatedAt,
          },
        ],
        { session },
      );

      await TeamBillingBalanceService.applyDelta(teamId, amount, session);
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
