import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/documents/documents";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { UserService } from "../user";
import { TeamService } from "~/modules/teams/team";
import type { User } from "../users.types";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/availableTeamUsers.route";

const documents = getDocumentsAdapter();

describe("availableTeamUsers.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when there is no session cookie", async () => {
    const res = await loader({
      request: new Request("http://localhost/available-team-users?teamId=123"),
      params: {},
    } as any);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("throws error when teamId is not provided", async () => {
    const user = (await documents.createDocument<User>({
      collection: "users",
      update: { username: "testuser", role: "USER" },
    })).data;

    const cookieHeader = await loginUser(user._id);

    await expect(
      loader({
        request: new Request("http://localhost/available-team-users", {
          headers: { cookie: cookieHeader },
        }),
        params: {},
      } as any)
    ).rejects.toThrow("Team id is not defined");
  });

  it("throws error when user cannot view team", async () => {
    const team = await TeamService.create({ name: "test team" });
    const user = (await documents.createDocument<User>({
      collection: "users",
      update: { username: "testuser", role: "USER", teams: [] },
    })).data;

    const cookieHeader = await loginUser(user._id);

    await expect(
      loader({
        request: new Request(
          `http://localhost/available-team-users?teamId=${team._id}`,
          { headers: { cookie: cookieHeader } }
        ),
        params: {},
      } as any)
    ).rejects.toThrow("Access denied");
  });

  it("returns users not in the team", async () => {
    const team = await TeamService.create({ name: "test team" });

    const admin = (await documents.createDocument<User>({
      collection: "users",
      update: {
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [{ team: team._id, role: "ADMIN" }],
      },
    })).data;

    // Create users: some in team, some not
    const userInTeam = await UserService.create({
      username: "in_team",
      role: "USER",
      githubId: 100001,
      hasGithubSSO: true,
      isRegistered: true,
      teams: [{ team: team._id, role: "ADMIN" }],
    });

    const userNotInTeam = await UserService.create({
      username: "not_in_team",
      role: "USER",
      githubId: 100002,
      hasGithubSSO: true,
      isRegistered: true,
      teams: [],
    });

    const cookieHeader = await loginUser(admin._id);

    const result = (await loader({
      request: new Request(
        `http://localhost/available-team-users?teamId=${team._id}`,
        { headers: { cookie: cookieHeader } }
      ),
      params: {},
    } as any)) as any;

    expect(result.data).toHaveLength(1);
    expect(result.data[0]._id).toBe(userNotInTeam._id);
  });

  it("returns only registered users", async () => {
    const team = await TeamService.create({ name: "test team" });

    const admin = (await documents.createDocument<User>({
      collection: "users",
      update: {
        username: "admin",
        role: "SUPER_ADMIN",
        teams: [{ team: team._id, role: "ADMIN" }],
      },
    })).data;

    // Create a registered user
    const registeredUser = await UserService.create({
      username: "registered",
      role: "USER",
      githubId: 100001,
      hasGithubSSO: true,
      isRegistered: true,
      teams: [],
    });

    // Create an unregistered user
    const unregisteredUser = await UserService.create({
      username: "unregistered",
      role: "USER",
      githubId: 100002,
      hasGithubSSO: true,
      isRegistered: false,
      teams: [],
    });

    const cookieHeader = await loginUser(admin._id);

    const result = (await loader({
      request: new Request(
        `http://localhost/available-team-users?teamId=${team._id}`,
        { headers: { cookie: cookieHeader } }
      ),
      params: {},
    } as any)) as any;

    expect(result.data).toHaveLength(1);
    expect(result.data[0]._id).toBe(registeredUser._id);
  });
});
