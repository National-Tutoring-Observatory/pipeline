import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { FeatureFlagService } from "~/modules/featureFlags/featureFlag";
import { ProjectService } from "~/modules/projects/project";
import { RunSetService } from "~/modules/runSets/runSet";
import { SessionService } from "~/modules/sessions/session";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import createTestRun from "../../../../test/helpers/createTestRun";
import loginUser from "../../../../test/helpers/loginUser";
import { action, loader } from "../containers/runSetMerge.route";

beforeEach(async () => {
  await clearDocumentDB();
  await FeatureFlagService.create({ name: "HAS_PROJECT_COLLECTIONS" });
});

describe("runSetMerge.route loader", () => {
  it("redirects to / when there is no session", async () => {
    const res = await loader({
      request: new Request("http://localhost/"),
      params: { projectId: "any", runSetId: "any" },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when project not found", async () => {
    const user = await UserService.create({
      username: "test_user",
      teams: [],
      featureFlags: ["HAS_PROJECT_COLLECTIONS"],
    });
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: {
        projectId: new Types.ObjectId().toString(),
        runSetId: "any",
      },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns mergeable runSets", async () => {
    const user = await UserService.create({
      username: "test_user",
      teams: [],
      featureFlags: ["HAS_PROJECT_COLLECTIONS"],
    });
    const team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });
    const session = await SessionService.create({
      name: "Test Session",
      project: project._id,
    });
    const runSet = await RunSetService.create({
      name: "Target",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const sourceRunSet = await RunSetService.create({
      name: "Source",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: { projectId: project._id, runSetId: runSet._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as any;
    expect(data.mergeableRunSets).toHaveLength(1);
    expect(data.mergeableRunSets[0]._id).toBe(sourceRunSet._id);
  });

  it("excludes runSets with different sessions", async () => {
    const user = await UserService.create({
      username: "test_user",
      teams: [],
      featureFlags: ["HAS_PROJECT_COLLECTIONS"],
    });
    const team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });
    const session1 = await SessionService.create({
      name: "Session 1",
      project: project._id,
    });
    const session2 = await SessionService.create({
      name: "Session 2",
      project: project._id,
    });
    const runSet = await RunSetService.create({
      name: "Target",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    await RunSetService.create({
      name: "Incompatible",
      project: project._id,
      sessions: [session2._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: { projectId: project._id, runSetId: runSet._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as any;
    expect(data.mergeableRunSets).toHaveLength(0);
  });
});

describe("runSetMerge.route action", () => {
  it("returns 403 when user cannot manage project", async () => {
    const owner = await UserService.create({ username: "owner", teams: [] });
    const team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(owner._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const project = await ProjectService.create({
      name: "Test Project",
      createdBy: owner._id,
      team: team._id,
    });
    const session = await SessionService.create({
      name: "Test Session",
      project: project._id,
    });
    const targetRunSet = await RunSetService.create({
      name: "Target",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });

    const otherUser = await UserService.create({
      username: "other_user",
      teams: [],
    });
    const otherCookie = await loginUser(otherUser._id);

    const req = new Request("http://localhost/", {
      method: "POST",
      headers: { cookie: otherCookie, "content-type": "application/json" },
      body: JSON.stringify({
        intent: "MERGE_RUN_SETS",
        payload: { sourceRunSetIds: ["any"] },
      }),
    });

    const resp = (await action({
      request: req,
      params: { projectId: project._id, runSetId: targetRunSet._id },
    } as any)) as any;

    expect(resp.init?.status).toBe(403);
  });

  it("merges runSets and redirects to runSet detail", async () => {
    const user = await UserService.create({
      username: "test_user",
      teams: [],
      featureFlags: ["HAS_PROJECT_COLLECTIONS"],
    });
    const team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });
    const session = await SessionService.create({
      name: "Test Session",
      project: project._id,
    });
    const targetRunSet = await RunSetService.create({
      name: "Target",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const sourceRun = await createTestRun({
      name: "Source Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session._id,
          status: "DONE",
          name: "Test Session",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });
    const sourceRunSet = await RunSetService.create({
      name: "Source",
      project: project._id,
      sessions: [session._id],
      runs: [sourceRun._id],
      annotationType: "PER_UTTERANCE",
    });
    const cookieHeader = await loginUser(user._id);

    const req = new Request("http://localhost/", {
      method: "POST",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      body: JSON.stringify({
        intent: "MERGE_RUN_SETS",
        payload: { sourceRunSetIds: [sourceRunSet._id] },
      }),
    });

    const resp = await action({
      request: req,
      params: { projectId: project._id, runSetId: targetRunSet._id },
    } as any);

    expect(resp).toBeInstanceOf(Response);
    expect((resp as Response).headers.get("Location")).toBe(
      `/projects/${project._id}/run-sets/${targetRunSet._id}`,
    );

    const updatedTarget = await RunSetService.findById(targetRunSet._id);
    expect(updatedTarget!.runs).toContain(sourceRun._id);
  });

  it("merges multiple runSets", async () => {
    const user = await UserService.create({
      username: "test_user",
      teams: [],
      featureFlags: ["HAS_PROJECT_COLLECTIONS"],
    });
    const team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });
    const session = await SessionService.create({
      name: "Test Session",
      project: project._id,
    });
    const targetRunSet = await RunSetService.create({
      name: "Target",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const run1 = await createTestRun({
      name: "Run 1",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session._id,
          status: "DONE",
          name: "Test Session",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });
    const run2 = await createTestRun({
      name: "Run 2",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [
        {
          sessionId: session._id,
          status: "DONE",
          name: "Test Session",
          fileType: "json",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });
    const source1 = await RunSetService.create({
      name: "Source 1",
      project: project._id,
      sessions: [session._id],
      runs: [run1._id],
      annotationType: "PER_UTTERANCE",
    });
    const source2 = await RunSetService.create({
      name: "Source 2",
      project: project._id,
      sessions: [session._id],
      runs: [run2._id],
      annotationType: "PER_UTTERANCE",
    });
    const cookieHeader = await loginUser(user._id);

    const req = new Request("http://localhost/", {
      method: "POST",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      body: JSON.stringify({
        intent: "MERGE_RUN_SETS",
        payload: { sourceRunSetIds: [source1._id, source2._id] },
      }),
    });

    const resp = await action({
      request: req,
      params: { projectId: project._id, runSetId: targetRunSet._id },
    } as any);

    expect(resp).toBeInstanceOf(Response);

    const updatedTarget = await RunSetService.findById(targetRunSet._id);
    expect(updatedTarget!.runs).toHaveLength(2);
    expect(updatedTarget!.runs).toContain(run1._id);
    expect(updatedTarget!.runs).toContain(run2._id);
  });
});
