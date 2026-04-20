import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import consumeTeamInvite from "../services/consumeTeamInvite.server";
import { TeamService } from "../team";
import { TeamInviteService } from "../teamInvites";

vi.mock("~/modules/analytics/helpers/trackServerEvent.server", () => ({
  default: vi.fn(),
}));

describe("consumeTeamInvite", () => {
  let team: Awaited<ReturnType<typeof TeamService.create>>;
  let admin: Awaited<ReturnType<typeof UserService.create>>;
  let invite: Awaited<ReturnType<typeof TeamInviteService.create>>;

  beforeEach(async () => {
    await clearDocumentDB();
    vi.clearAllMocks();
    team = await TeamService.create({ name: "Test Team" });
    admin = await UserService.create({ username: "admin", teams: [] });
    invite = await TeamInviteService.create({
      team: team._id,
      name: "Test Invite",
      maxUses: 10,
      createdBy: admin._id,
    });
  });

  it("creates a new user when the github user has no account", async () => {
    const result = await consumeTeamInvite({
      inviteId: invite._id,
      githubUser: { id: 42, login: "newcomer", name: "New Comer" },
      primaryEmail: "new@example.com",
    });
    expect(result.status).toBe("success");
    expect(result.isNewUser).toBe(true);
    // New users get both the invited team and a personal workspace from setupNewUser,
    // matching the existing single-use invite convention in githubStrategy.ts.
    expect(result.user!.teams).toHaveLength(2);
    const inviteTeam = result.user!.teams.find((t) => t.team === team._id);
    expect(inviteTeam).toBeDefined();
    expect(inviteTeam!.role).toBe("MEMBER");
    expect(inviteTeam!.viaTeamInvite).toBe(invite._id);

    const updatedInvite = await TeamInviteService.findById(invite._id);
    expect(updatedInvite?.usedCount).toBe(1);
  });

  it("adds team to an existing user not in the team", async () => {
    const existing = await UserService.create({
      username: "existing",
      name: "Existing",
      githubId: 99,
      hasGithubSSO: true,
      isRegistered: true,
      teams: [],
    });
    const result = await consumeTeamInvite({
      inviteId: invite._id,
      githubUser: { id: 99, login: "existing", name: "Existing" },
      primaryEmail: "existing@example.com",
    });
    expect(result.status).toBe("success");
    expect(result.isNewUser).toBe(false);
    expect(result.user!._id).toBe(existing._id);
    const inviteTeam = result.user!.teams.find((t) => t.team === team._id);
    expect(inviteTeam).toBeDefined();
    expect(inviteTeam!.viaTeamInvite).toBe(invite._id);

    const updatedInvite = await TeamInviteService.findById(invite._id);
    expect(updatedInvite?.usedCount).toBe(1);
  });

  it("is a no-op for an existing user already in the team", async () => {
    const existing = await UserService.create({
      username: "existing",
      name: "Existing",
      githubId: 99,
      hasGithubSSO: true,
      isRegistered: true,
      teams: [{ team: team._id, role: "MEMBER" }],
    });
    const result = await consumeTeamInvite({
      inviteId: invite._id,
      githubUser: { id: 99, login: "existing", name: "Existing" },
      primaryEmail: "existing@example.com",
    });
    expect(result.status).toBe("already_member");
    expect(result.user!._id).toBe(existing._id);

    const updatedInvite = await TeamInviteService.findById(invite._id);
    expect(updatedInvite?.usedCount).toBe(0);
  });

  it("rejects a revoked invite", async () => {
    await TeamInviteService.revokeById(invite._id, admin._id);
    const result = await consumeTeamInvite({
      inviteId: invite._id,
      githubUser: { id: 1, login: "a", name: "A" },
      primaryEmail: "a@example.com",
    });
    expect(result.status).toBe("revoked");
  });

  it("rejects a full invite", async () => {
    const fullInvite = await TeamInviteService.create({
      team: team._id,
      name: "Full",
      maxUses: 1,
      createdBy: admin._id,
    });
    await consumeTeamInvite({
      inviteId: fullInvite._id,
      githubUser: { id: 1, login: "a", name: "A" },
      primaryEmail: "a@example.com",
    });
    const result = await consumeTeamInvite({
      inviteId: fullInvite._id,
      githubUser: { id: 2, login: "b", name: "B" },
      primaryEmail: "b@example.com",
    });
    expect(result.status).toBe("full");
  });
});
