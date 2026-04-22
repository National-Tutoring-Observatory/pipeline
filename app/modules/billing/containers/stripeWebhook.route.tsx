import { data } from "react-router";
import { BillingLedgerEntryService } from "../billingLedgerEntry";
import { StripeService } from "../stripe";
import { TeamBillingService } from "../teamBilling";
import type { Route } from "./+types/stripeWebhook.route";

export async function action({ request }: Route.ActionArgs) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return data({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = StripeService.constructWebhookEvent(body, sig);
  } catch {
    return data({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { teamId, userId } = session.metadata ?? {};
    const amountTotal = session.amount_total;

    if (
      teamId &&
      userId &&
      typeof amountTotal === "number" &&
      session.payment_status === "paid"
    ) {
      const alreadyProcessed =
        await BillingLedgerEntryService.findCreditByStripeSession(session.id);
      if (!alreadyProcessed) {
        try {
          await TeamBillingService.applyStripeTopUp({
            teamId,
            amount: amountTotal / 100,
            userId,
            stripeSessionId: session.id,
            paymentStatus: session.payment_status,
          });
        } catch (err: unknown) {
          // 11000 is MongoDB's duplicate key error — means another concurrent
          // request already inserted this session, safe to ignore
          if ((err as { code?: number }).code !== 11000) throw err;
        }
      }
    }
  }

  return data({ received: true });
}
