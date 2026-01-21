import { beforeEach, describe, expect, it } from "vitest";
import { TeamService } from "../team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { loader, action } from "../containers/teams.route";

describe("teams.route", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  describe("loader", () => {
    it("redirects to / when there is no session cookie", async () => {
      const res = await loader({
        request: new Request("http://localhost/teams"),
        params: {},
      } as any);
      expect(res).toBeInstanceOf(Response);
      expect((res as Response).headers.get("Location")).toBe("/");
    });

    it("returns all teams for super admin", async () => {
      const team1 = await TeamService.create({ name: "team 1" });
      const team2 = await TeamService.create({ name: "team 2" });

      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [],
      });

      const cookieHeader = await loginUser(admin._id);

      const result = (await loader({
        request: new Request("http://localhost/teams", {
          headers: { cookie: cookieHeader },
        }),
        params: {},
      } as any)) as any;

      expect(result.teams.data).toHaveLength(2);
      expect(result.teams.data.map((t: any) => t._id)).toContain(team1._id);
      expect(result.teams.data.map((t: any) => t._id)).toContain(team2._id);
    });

    it("returns only user's teams for regular user", async () => {
      const team1 = await TeamService.create({ name: "team 1" });
      const team2 = await TeamService.create({ name: "team 2" });
      const team3 = await TeamService.create({ name: "team 3" });

      const user = await UserService.create({
        username: "user1",
        role: "USER",
        teams: [{ team: team1._id, role: "ADMIN" }],
      });

      const cookieHeader = await loginUser(user._id);

      const result = (await loader({
        request: new Request("http://localhost/teams", {
          headers: { cookie: cookieHeader },
        }),
        params: {},
      } as any)) as any;

      expect(result.teams.data).toHaveLength(1);
      expect(result.teams.data[0]._id).toBe(team1._id);
    });
  });

  describe("action - CREATE_TEAM", () => {
    it("creates a team when user is super admin", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
      });

      const cookieHeader = await loginUser(admin._id);

      const result = (await action({
        request: new Request("http://localhost/teams", {
          method: "POST",
          headers: { cookie: cookieHeader },
          body: JSON.stringify({
            intent: "CREATE_TEAM",
            payload: { name: "new team" },
          }),
        }),
        params: {},
      } as any)) as any;

      expect(result.intent).toBe("CREATE_TEAM");
      expect(result.data._id).toBeDefined();
      expect(result.data.name).toBe("new team");

      const retrieved = await TeamService.findById(result.data._id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("new team");
    });

    it("throws when team name is missing", async () => {
      const admin = await UserService.create({
        username: "admin",
        role: "SUPER_ADMIN",
      });

      const cookieHeader = await loginUser(admin._id);

      await expect(
        action({
          request: new Request("http://localhost/teams", {
            method: "POST",
            headers: { cookie: cookieHeader },
            body: JSON.stringify({ intent: "CREATE_TEAM", payload: {} }),
          }),
          params: {},
        } as any),
      ).rejects.toThrow(/Team name is required/);
    });
  });

  describe("action - UPDATE_TEAM", () => {
    it("updates team when user is team admin", async () => {
      const team = await TeamService.create({ name: "original" });
      const user = await UserService.create({
        username: "user1",
        role: "USER",
        teams: [{ team: team._id, role: "ADMIN" }],
      });

      const cookieHeader = await loginUser(user._id);

      const result = (await action({
        request: new Request("http://localhost/teams", {
          method: "PUT",
          headers: { cookie: cookieHeader },
          body: JSON.stringify({
            intent: "UPDATE_TEAM",
            entityId: team._id,
            payload: { name: "updated" },
          }),
        }),
        params: {},
      } as any)) as any;

      expect(result.data._id).toBe(team._id);
      expect(result.data.name).toBe("updated");

      const retrieved = await TeamService.findById(team._id);
      expect(retrieved?.name).toBe("updated");
    });
  });
});
