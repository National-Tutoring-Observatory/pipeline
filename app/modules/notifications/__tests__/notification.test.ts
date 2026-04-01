import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationService } from "../notification";

vi.mock("~/modules/queues/helpers/createGeneralJob", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

import createGeneralJob from "~/modules/queues/helpers/createGeneralJob";

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("notifyCreditsExhausted", () => {
    it("enqueues a job with stable jobId when SLACK_WEBHOOK_URL is set", async () => {
      process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/test";

      await NotificationService.notifyCreditsExhausted("team-123");

      expect(createGeneralJob).toHaveBeenCalledWith(
        "NOTIFY_CREDITS_EXHAUSTED",
        { teamId: "team-123" },
        { jobId: "notify-credits-exhausted-team-123", attempts: 3 },
      );
    });

    it("does not enqueue when SLACK_WEBHOOK_URL is not set", async () => {
      delete process.env.SLACK_WEBHOOK_URL;

      await NotificationService.notifyCreditsExhausted("team-123");

      expect(createGeneralJob).not.toHaveBeenCalled();
    });
  });

  describe("deliver", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("sends message to Slack webhook", async () => {
      process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/test";
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response(null, { status: 200 }));

      await NotificationService.deliver("test message");

      expect(fetchSpy).toHaveBeenCalledWith("https://hooks.slack.com/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "test message" }),
      });
    });

    it("does nothing when SLACK_WEBHOOK_URL is not set", async () => {
      delete process.env.SLACK_WEBHOOK_URL;
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      await NotificationService.deliver("test message");

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("throws when Slack returns a non-OK response", async () => {
      process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/test";
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(null, { status: 500 }),
      );

      await expect(NotificationService.deliver("test")).rejects.toThrow(
        "Slack webhook failed: 500",
      );
    });
  });
});
