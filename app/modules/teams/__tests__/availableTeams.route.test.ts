import { beforeEach, describe, expect, it } from "vitest";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import expectAuthRequired from "../../../../test/helpers/expectAuthRequired";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/availableTeams.route";
import { TeamService } from "../team";

describe("availableTeams.route", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  describe("loader", () => {
    it("redirects when there is no session cookie", async () => {
      await expectAuthRequired(() =>
        loader({
          request: new Request("http://localhost/api/availableTeams"),
          params: {},
        } as any),
      );
    });

    it("returns only teams the user belongs to", async () => {
      const team1 = await TeamService.create({ name: "team 1" });
      await TeamService.create({ name: "team 2" });

      const user = await UserService.create({
        username: "user1",
        role: "USER",
        teams: [{ team: team1._id, role: "MEMBER" }],
      });

      const cookieHeader = await loginUser(user._id);

      const result = (await loader({
        request: new Request("http://localhost/api/availableTeams", {
          headers: { cookie: cookieHeader },
        }),
        params: {},
      } as any)) as any;

      expect(result.teams.data).toHaveLength(1);
      expect(result.teams.data[0]._id).toBe(team1._id);
    });

    it("returns empty list for a user with no teams", async () => {
      const user = await UserService.create({
        username: "user1",
        role: "USER",
        teams: [],
      });

      const cookieHeader = await loginUser(user._id);

      const result = (await loader({
        request: new Request("http://localhost/api/availableTeams", {
          headers: { cookie: cookieHeader },
        }),
        params: {},
      } as any)) as any;

      expect(result.teams.data).toHaveLength(0);
    });
  });
});
