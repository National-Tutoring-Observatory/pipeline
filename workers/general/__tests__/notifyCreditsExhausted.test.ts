import { beforeEach, describe, expect, it, vi } from "vitest";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../test/helpers/clearDocumentDB";
import notifyCreditsExhausted from "../notifyCreditsExhausted";

vi.mock("~/modules/notifications/notification", () => ({
  NotificationService: {
    deliver: vi.fn().mockResolvedValue(undefined),
  },
}));

import { NotificationService } from "~/modules/notifications/notification";

describe("notifyCreditsExhausted worker", () => {
  beforeEach(async () => {
    await clearDocumentDB();
    vi.clearAllMocks();
  });

  it("delivers notification with team and user info", async () => {
    const user = await UserService.create({
      username: "researcher1",
      name: "Jane Smith",
      email: "jane@mit.edu",
      githubId: 1,
      institution: "MIT",
    });

    const team = await TeamService.create({
      name: "Research Lab",
      createdBy: user._id,
    });

    const result = await notifyCreditsExhausted({
      data: { teamId: team._id },
    } as any);

    expect(result.status).toBe("OK");
    expect(NotificationService.deliver).toHaveBeenCalledOnce();

    const message = vi.mocked(NotificationService.deliver).mock.calls[0][0];
    expect(message).toContain("Research Lab");
    expect(message).toContain(team._id);
    expect(message).toContain("Jane Smith");
    expect(message).toContain(user._id);
    expect(message).toContain("jane@mit.edu");
    expect(message).toContain("MIT");
  });

  it("uses fallback values when user has no name/email/institution", async () => {
    const user = await UserService.create({
      username: "user1",
      githubId: 2,
    });

    const team = await TeamService.create({
      name: "Test Team",
      createdBy: user._id,
    });

    const result = await notifyCreditsExhausted({
      data: { teamId: team._id },
    } as any);

    expect(result.status).toBe("OK");

    const message = vi.mocked(NotificationService.deliver).mock.calls[0][0];
    expect(message).toContain("Test Team");
    expect(message).toContain("—");
  });

  it("returns ERRORED when teamId is missing", async () => {
    const result = await notifyCreditsExhausted({
      data: {},
    } as any);

    expect(result.status).toBe("ERRORED");
    expect(result.message).toBe("Missing teamId");
    expect(NotificationService.deliver).not.toHaveBeenCalled();
  });

  it("returns ERRORED when team not found", async () => {
    const result = await notifyCreditsExhausted({
      data: { teamId: "000000000000000000000000" },
    } as any);

    expect(result.status).toBe("ERRORED");
    expect(result.message).toBe("Team not found");
    expect(NotificationService.deliver).not.toHaveBeenCalled();
  });
});
