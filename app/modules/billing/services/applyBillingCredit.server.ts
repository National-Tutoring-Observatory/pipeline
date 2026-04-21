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
  note,
  source,
  sourceId,
  idempotencyKey,
  stripeSessionId,
  metadata,
}: ApplyBillingCreditInput): Promise<void> {
  await TeamBillingBalanceService.ensureInitialized(teamId);

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
        },
      ],
      { session },
    );

    await TeamBillingBalanceService.applyDelta(teamId, amount, session);
  });
}
