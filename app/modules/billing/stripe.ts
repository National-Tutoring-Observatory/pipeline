import Stripe from "stripe";
import { TeamService } from "~/modules/teams/team";
import type { Team } from "~/modules/teams/teams.types";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return _stripe;
}

export class StripeService {
  static constructWebhookEvent(body: string, sig: string): Stripe.Event {
    return getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }

  static async ensureCustomer(team: Team): Promise<string> {
    if (team.stripeCustomerId) return team.stripeCustomerId;

    const customer = await getStripe().customers.create(
      { name: team.name, metadata: { teamId: team._id } },
      { idempotencyKey: `team-customer-${team._id}` },
    );

    await TeamService.setStripeCustomerIdIfMissing(team._id, customer.id);

    return customer.id;
  }

  static async createCheckoutSession(params: {
    customerId: string;
    amount: number;
    successUrl: string;
    cancelUrl: string;
    metadata: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    return getStripe().checkout.sessions.create({
      customer: params.customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(params.amount * 100),
            product_data: { name: "Credits" },
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    });
  }
}
