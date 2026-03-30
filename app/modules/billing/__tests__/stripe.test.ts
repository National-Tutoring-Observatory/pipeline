import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamService } from "~/modules/teams/team";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { StripeService } from "../stripe";

const mocks = vi.hoisted(() => ({
  customersCreate: vi.fn(),
  sessionsCreate: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      customers: { create: mocks.customersCreate },
      webhooks: { constructEvent: vi.fn() },
      checkout: { sessions: { create: mocks.sessionsCreate } },
    };
  }),
}));

describe("StripeService", () => {
  beforeEach(async () => {
    await clearDocumentDB();
    mocks.customersCreate.mockReset();
    mocks.sessionsCreate.mockReset();
  });

  describe("ensureCustomer", () => {
    it("returns existing stripeCustomerId without calling Stripe", async () => {
      const team = await TeamService.create({ name: "Test Team" });
      await TeamService.updateById(team._id, {
        stripeCustomerId: "cus_existing",
      });
      const teamWithCustomer = (await TeamService.findById(team._id))!;

      const result = await StripeService.ensureCustomer(teamWithCustomer);

      expect(result).toBe("cus_existing");
      expect(mocks.customersCreate).not.toHaveBeenCalled();
    });

    it("creates a Stripe customer and persists the ID when none exists", async () => {
      const team = await TeamService.create({ name: "Test Team" });
      mocks.customersCreate.mockResolvedValue({ id: "cus_new123" });

      const result = await StripeService.ensureCustomer(team);

      expect(result).toBe("cus_new123");
      expect(mocks.customersCreate).toHaveBeenCalledWith(
        { name: "Test Team", metadata: { teamId: team._id } },
        { idempotencyKey: `team-customer-${team._id}` },
      );

      const updated = await TeamService.findById(team._id);
      expect(updated?.stripeCustomerId).toBe("cus_new123");
    });
  });
});
