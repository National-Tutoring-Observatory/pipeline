import { beforeEach, describe, expect, it } from "vitest";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { action } from "../containers/generateInviteToTeam.route";

describe("generateInviteToTeam.route action", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("returns 400 when an invalid role is supplied", async () => {
    const admin = await UserService.create({ username: "admin", teams: [] });
    const team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(admin._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const cookieHeader = await loginUser(admin._id);

    const resp = (await action({
      request: new Request("http://localhost/api/teams/generateInviteToTeam", {
        method: "POST",
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "GENERATE_INVITE_LINK",
          payload: {
            teamId: team._id,
            role: "SUPERADMIN",
            name: "Invited User",
          },
        }),
      }),
    } as any)) as any;

    expect(resp.init?.status).toBe(400);
  });
});
