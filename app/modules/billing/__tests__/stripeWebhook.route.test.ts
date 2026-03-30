import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { action } from "../containers/stripeWebhook.route";
import { StripeService } from "../stripe";
import { TeamCreditService } from "../teamCredit";

vi.mock("~/modules/billing/stripe", () => ({
  StripeService: {
    constructWebhookEvent: vi.fn(),
  },
}));

function buildRequest(body: string, sig?: string) {
  return {
    request: new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: sig ? { "stripe-signature": sig } : {},
      body,
    }),
    params: {},
  } as any;
}

describe("stripeWebhook.route action", () => {
  beforeEach(async () => {
    await clearDocumentDB();
    vi.clearAllMocks();
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const result = await action(buildRequest("{}"));
    expect(result.init?.status).toBe(400);
    expect((result.data as any).error).toBe("Missing signature");
  });

  it("returns 400 when signature verification fails", async () => {
    vi.mocked(StripeService.constructWebhookEvent).mockImplementation(() => {
      throw new Error("Webhook signature verification failed");
    });

    const result = await action(buildRequest("{}", "bad-sig"));
    expect(result.init?.status).toBe(400);
    expect((result.data as any).error).toBe("Invalid signature");
  });

  it("creates a TeamCredit on checkout.session.completed", async () => {
    const team = await TeamService.create({ name: "Test Team" });
    const user = await UserService.create({
      username: "user",
      role: "USER",
      teams: [],
    });

    vi.mocked(StripeService.constructWebhookEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          metadata: { teamId: team._id, userId: user._id.toString() },
          amount_total: 2500,
          payment_status: "paid",
        },
      },
    } as any);

    const result = await action(buildRequest("{}", "valid-sig"));
    expect(result.data).toEqual({ received: true });

    const credits = await TeamCreditService.findByTeam(team._id);
    expect(credits).toHaveLength(1);
    expect(credits[0].amount).toBe(25);
    expect(credits[0].note).toBe("Purchased via Stripe");
    expect(credits[0].addedBy).toBe(user._id.toString());
    expect(credits[0].stripeSessionId).toBe("cs_test_123");
  });

  it("does not create a TeamCredit for other event types", async () => {
    const team = await TeamService.create({ name: "Test Team" });

    vi.mocked(StripeService.constructWebhookEvent).mockReturnValue({
      type: "payment_intent.succeeded",
      data: { object: {} },
    } as any);

    const result = await action(buildRequest("{}", "valid-sig"));
    expect(result.data).toEqual({ received: true });

    const credits = await TeamCreditService.findByTeam(team._id);
    expect(credits).toHaveLength(0);
  });

  it("does not create a TeamCredit when payment_status is not paid", async () => {
    const team = await TeamService.create({ name: "Test Team" });
    const user = await UserService.create({
      username: "user2",
      role: "USER",
      teams: [],
    });

    vi.mocked(StripeService.constructWebhookEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_unpaid",
          metadata: { teamId: team._id, userId: user._id.toString() },
          amount_total: 2500,
          payment_status: "unpaid",
        },
      },
    } as any);

    await action(buildRequest("{}", "valid-sig"));

    const credits = await TeamCreditService.findByTeam(team._id);
    expect(credits).toHaveLength(0);
  });

  it("does not create duplicate credits when webhook fires twice", async () => {
    const team = await TeamService.create({ name: "Test Team" });
    const user = await UserService.create({
      username: "user3",
      role: "USER",
      teams: [],
    });

    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_duplicate",
          metadata: { teamId: team._id, userId: user._id.toString() },
          amount_total: 2500,
          payment_status: "paid",
        },
      },
    } as any;

    vi.mocked(StripeService.constructWebhookEvent).mockReturnValue(event);
    await action(buildRequest("{}", "sig1"));
    await action(buildRequest("{}", "sig2"));

    const credits = await TeamCreditService.findByTeam(team._id);
    expect(credits).toHaveLength(1);
  });

  it("handles concurrent duplicate inserts via unique index (E11000)", async () => {
    const team = await TeamService.create({ name: "Test Team" });
    const user = await UserService.create({
      username: "user4",
      role: "USER",
      teams: [],
    });

    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_concurrent",
          metadata: { teamId: team._id, userId: user._id.toString() },
          amount_total: 2500,
          payment_status: "paid",
        },
      },
    } as any;

    vi.mocked(StripeService.constructWebhookEvent).mockReturnValue(event);

    // Simulate the race: both requests pass the app-level check simultaneously
    vi.spyOn(TeamCreditService, "findByStripeSession").mockResolvedValue(null);

    await Promise.all([
      action(buildRequest("{}", "sig1")),
      action(buildRequest("{}", "sig2")),
    ]);

    const credits = await TeamCreditService.findByTeam(team._id);
    expect(credits).toHaveLength(1);
  });

  it("does not create a TeamCredit when metadata is incomplete", async () => {
    const team = await TeamService.create({ name: "Test Team" });

    vi.mocked(StripeService.constructWebhookEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_incomplete",
          metadata: { teamId: team._id },
          amount_total: 2500,
          payment_status: "paid",
        },
      },
    } as any);

    await action(buildRequest("{}", "valid-sig"));

    const credits = await TeamCreditService.findByTeam(team._id);
    expect(credits).toHaveLength(0);
  });
});
