import applyBillingCredit from "./applyBillingCredit.server";

const MINIMUM_TOPUP_AMOUNT = 10;

interface AddCreditsInput {
  teamId: string;
  amount: number;
  note?: string;
  addedBy: string;
  idempotencyKey: string;
}

export interface AddCreditsResult {
  success: boolean;
  error?: string;
}

export default async function addCredits({
  teamId,
  amount,
  note,
  addedBy,
  idempotencyKey,
}: AddCreditsInput): Promise<AddCreditsResult> {
  if (!idempotencyKey.trim()) {
    return { success: false, error: "Idempotency key is required" };
  }

  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return { success: false, error: "Invalid amount" };
  }

  if (!Number.isInteger(amount)) {
    return { success: false, error: "Amount must be a whole dollar value" };
  }

  if (amount < MINIMUM_TOPUP_AMOUNT) {
    return {
      success: false,
      error: `Minimum top-up amount is $${MINIMUM_TOPUP_AMOUNT}`,
    };
  }

  await applyBillingCredit({
    teamId,
    amount,
    addedBy,
    note: note?.trim() || "Added by System Admin",
    source: "admin-credit",
    sourceId: idempotencyKey,
    idempotencyKey,
  });

  return { success: true };
}
