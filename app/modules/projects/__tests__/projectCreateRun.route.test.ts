import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/projectCreateRun.route";
import { ProjectService } from "../project";

describe("projectCreateRun.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when project not found", async () => {
    const user = await UserService.create({ username: "test_user" });
    const cookieHeader = await loginUser(user._id);
    const fakeProjectId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" + fakeProjectId + "/create-run",
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: fakeProjectId },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when user is not in project team", async () => {
    const owner = await UserService.create({ username: "owner", teams: [] });
    const otherUser = await UserService.create({
      username: "other_user",
      teams: [],
    });
    const team = await TeamService.create({ name: "Private Team" });

    await UserService.updateById(owner._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });

    const project = await ProjectService.create({
      name: "Private Project",
      createdBy: owner._id,
      team: team._id,
    });

    const cookieHeader = await loginUser(otherUser._id);

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" + project._id + "/create-run",
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: project._id },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns project data for authorized users", async () => {
    const user = await UserService.create({ username: "test_user", teams: [] });
    const team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });

    const project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" + project._id + "/create-run",
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: project._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const loaderData = res as any;
    // Ensure project is unwrapped, not { data: ... }
    expect(loaderData.project._id).toBe(project._id);
    expect(loaderData.project.name).toBe("Test Project");
    expect(loaderData.project.data).toBeUndefined();
  });
});
