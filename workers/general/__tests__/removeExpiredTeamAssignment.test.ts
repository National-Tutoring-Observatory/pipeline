import { beforeEach, describe, expect, it } from "vitest";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../test/helpers/clearDocumentDB";
import removeExpiredTeamAssignment from "../removeExpiredTeamAssignment";

describe("removeExpiredTeamAssignment worker", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("removes team assignment from user atomically", async () => {
    const team = await TeamService.create({ name: "test-team" });

    const user = await UserService.create({
      username: "user1",
      githubId: 1,
      teams: [{ team: team._id, role: "ADMIN" }],
    });

    const result = await removeExpiredTeamAssignment({
      data: { userId: user._id, teamId: team._id },
    } as any);

    expect(result.status).toBe("OK");
    expect(result.message).toBe("Team assignment removed");

    const updatedUser = await UserService.findById(user._id);
    expect(updatedUser?.teams).not.toContainEqual({
      team: team._id,
      role: "ADMIN",
    });
  });

  it("removes only the specified team, keeping other teams", async () => {
    const team1 = await TeamService.create({ name: "team-1" });
    const team2 = await TeamService.create({ name: "team-2" });

    const user = await UserService.create({
      username: "user1",
      githubId: 1,
      teams: [
        { team: team1._id, role: "ADMIN" },
        { team: team2._id, role: "ADMIN" },
      ],
    });

    const result = await removeExpiredTeamAssignment({
      data: { userId: user._id, teamId: team1._id },
    } as any);

    expect(result.status).toBe("OK");

    const updatedUser = await UserService.findById(user._id);
    expect(updatedUser?.teams).not.toContainEqual({
      team: team1._id,
      role: "ADMIN",
    });
    expect(updatedUser?.teams).toContainEqual({
      team: team2._id,
      role: "ADMIN",
    });
  });

  it("returns ERRORED when userId is missing", async () => {
    const team = await TeamService.create({ name: "test-team" });

    const result = await removeExpiredTeamAssignment({
      data: { teamId: team._id },
    } as any);

    expect(result.status).toBe("ERRORED");
    expect(result.message).toBe("Missing userId or teamId");
  });

  it("returns ERRORED when teamId is missing", async () => {
    const user = await UserService.create({
      username: "user1",
      githubId: 1,
    });

    const result = await removeExpiredTeamAssignment({
      data: { userId: user._id },
    } as any);

    expect(result.status).toBe("ERRORED");
    expect(result.message).toBe("Missing userId or teamId");
  });

  it("returns ERRORED when job.data is missing", async () => {
    const result = await removeExpiredTeamAssignment({
      data: undefined,
    } as any);

    expect(result.status).toBe("ERRORED");
    expect(result.message).toBe("Missing userId or teamId");
  });
});
