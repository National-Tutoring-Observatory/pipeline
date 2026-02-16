import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import createTestRun from "../../../../test/helpers/createTestRun";
import loginUser from "../../../../test/helpers/loginUser";
import { action, loader } from "../containers/runs.route";

describe("runs.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("returns empty runs list for project with no runs", async () => {
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
        "http://localhost/projects/" + project._id + "/runs",
        { headers: { cookie: cookieHeader } },
      ),
      params: { id: project._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    expect((res as any).runs.data).toEqual([]);
    expect((res as any).runs.totalPages).toBe(0);
  });

  it("returns runs list for project with runs", async () => {
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

    const run = await createTestRun({
      name: "Test Run",
      project: project._id,
      isRunning: false,
      isComplete: false,
    });

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" + project._id + "/runs",
        { headers: { cookie: cookieHeader } },
      ),
      params: { id: project._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    expect((res as any).runs.data).toHaveLength(1);
    expect((res as any).runs.data[0]._id).toBe(run._id);
    expect((res as any).runs.data[0].name).toBe("Test Run");
    // Ensure no .data property on returned run
    expect((res as any).runs.data[0].data).toBeUndefined();
  });
});

describe("runs.route action - UPDATE_RUN", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("returns 400 when project not found", async () => {
    const user = await UserService.create({ username: "test_user" });
    const cookieHeader = await loginUser(user._id);
    const fakeProjectId = new Types.ObjectId().toString();
    const fakeRunId = new Types.ObjectId().toString();

    const req = new Request("http://localhost/projects/" + fakeProjectId, {
      method: "PUT",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      body: JSON.stringify({
        intent: "UPDATE_RUN",
        entityId: fakeRunId,
        payload: { name: "New Name" },
      }),
    });

    const resp = (await action({
      request: req,
      params: { id: fakeProjectId },
    } as any)) as any;
    expect(resp.init?.status).toBe(400);
    expect(resp.data?.errors?.project).toBe("Project not found");
  });

  it("updates run name successfully", async () => {
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

    const run = await createTestRun({
      name: "Old Name",
      project: project._id,
      isRunning: false,
      isComplete: false,
    });

    const cookieHeader = await loginUser(user._id);

    const req = new Request("http://localhost/projects/" + project._id, {
      method: "PUT",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      body: JSON.stringify({
        intent: "UPDATE_RUN",
        entityId: run._id,
        payload: { name: "New Name" },
      }),
    });

    const resp = await action({
      request: req,
      params: { id: project._id },
    } as any);

    expect(resp).not.toBeInstanceOf(Response);
    const updatedRun = await RunService.findById(run._id);
    expect(updatedRun?.name).toBe("New Name");
  });
});
