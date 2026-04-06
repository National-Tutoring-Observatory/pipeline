import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamBillingService } from "~/modules/billing/teamBilling";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../test/helpers/clearDocumentDB";
import reportLowCredits from "../reportLowCredits";

vi.mock("~/modules/notifications/notification", () => ({
  NotificationService: {
    deliver: vi.fn().mockResolvedValue(undefined),
  },
}));

import { NotificationService } from "~/modules/notifications/notification";

const mockJob = { data: {} } as any;

describe("reportLowCredits worker", () => {
  beforeEach(async () => {
    await clearDocumentDB();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/test";
  });

  it("skips when SLACK_WEBHOOK_URL is not set", async () => {
    delete process.env.SLACK_WEBHOOK_URL;

    const result = await reportLowCredits(mockJob);

    expect(result.status).toBe("OK");
    expect(result.message).toContain("No Slack webhook");
    expect(NotificationService.deliver).not.toHaveBeenCalled();
  });

  it("returns early when no teams are below threshold", async () => {
    const user = await UserService.create({ username: "u1", githubId: 1 });
    await TeamService.create({ name: "Rich Team", createdBy: user._id });

    vi.spyOn(TeamBillingService, "getBalance").mockResolvedValue(10);

    const result = await reportLowCredits(mockJob);

    expect(result.status).toBe("OK");
    expect(result.message).toBe("No teams with low credits");
    expect(NotificationService.deliver).not.toHaveBeenCalled();
  });

  it("reports teams with balance below $5", async () => {
    const user = await UserService.create({
      username: "researcher1",
      name: "Jane Smith",
      email: "jane@mit.edu",
      githubId: 1,
      institution: "MIT",
    });
    const team = await TeamService.create({
      name: "Low Credits Lab",
      createdBy: user._id,
    });

    vi.spyOn(TeamBillingService, "getBalance").mockResolvedValue(2.5);

    const result = await reportLowCredits(mockJob);

    expect(result.status).toBe("OK");
    expect(NotificationService.deliver).toHaveBeenCalledOnce();

    const message = vi.mocked(NotificationService.deliver).mock.calls[0][0];
    expect(message).toContain("Low Credits Lab");
    expect(message).toContain(String(team._id));
    expect(message).toContain("$2.50");
    expect(message).toContain("Jane Smith");
    expect(message).toContain("jane@mit.edu");
    expect(message).toContain("MIT");
  });

  it("excludes teams with balance at or above $5", async () => {
    const user = await UserService.create({ username: "u1", githubId: 1 });
    const poorTeam = await TeamService.create({
      name: "Poor Team",
      createdBy: user._id,
    });
    await TeamService.create({
      name: "Rich Team",
      createdBy: user._id,
    });

    vi.spyOn(TeamBillingService, "getBalance").mockImplementation(
      async (teamId) => (String(teamId) === String(poorTeam._id) ? 1.99 : 5.0),
    );

    const result = await reportLowCredits(mockJob);

    expect(result.status).toBe("OK");
    const message = vi.mocked(NotificationService.deliver).mock.calls[0][0];
    expect(message).toContain("Poor Team");
    expect(message).not.toContain("Rich Team");
  });

  it("includes all low-credit teams in a single message", async () => {
    const user = await UserService.create({ username: "u1", githubId: 1 });
    await TeamService.create({ name: "Team A", createdBy: user._id });
    await TeamService.create({ name: "Team B", createdBy: user._id });

    vi.spyOn(TeamBillingService, "getBalance").mockResolvedValue(0.5);

    await reportLowCredits(mockJob);

    expect(NotificationService.deliver).toHaveBeenCalledOnce();
    const message = vi.mocked(NotificationService.deliver).mock.calls[0][0];
    expect(message).toContain("Team A");
    expect(message).toContain("Team B");
    expect(message).toContain("2 team(s)");
  });
});
