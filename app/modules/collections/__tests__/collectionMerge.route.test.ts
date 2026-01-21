import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { CollectionService } from "~/modules/collections/collection";
import { FeatureFlagService } from "~/modules/featureFlags/featureFlag";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import { SessionService } from "~/modules/sessions/session";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { action, loader } from "../containers/collectionMerge.route";

beforeEach(async () => {
  await clearDocumentDB();
  await FeatureFlagService.create({ name: "HAS_PROJECT_COLLECTIONS" });
});

describe("collectionMerge.route loader", () => {
  it("redirects to / when there is no session", async () => {
    const res = await loader({
      request: new Request("http://localhost/"),
      params: { projectId: "any", collectionId: "any" },
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
        collectionId: "any",
      },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns mergeable collections", async () => {
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
    const collection = await CollectionService.create({
      name: "Target",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const sourceCollection = await CollectionService.create({
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
      params: { projectId: project._id, collectionId: collection._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as any;
    expect(data.mergeableCollections).toHaveLength(1);
    expect(data.mergeableCollections[0]._id).toBe(sourceCollection._id);
  });

  it("excludes collections with different sessions", async () => {
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
    const collection = await CollectionService.create({
      name: "Target",
      project: project._id,
      sessions: [session1._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    await CollectionService.create({
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
      params: { projectId: project._id, collectionId: collection._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as any;
    expect(data.mergeableCollections).toHaveLength(0);
  });
});

describe("collectionMerge.route action", () => {
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
    const collection = await CollectionService.create({
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
        intent: "MERGE_COLLECTIONS",
        payload: { sourceCollectionIds: ["any"] },
      }),
    });

    const resp = (await action({
      request: req,
      params: { projectId: project._id, collectionId: collection._id },
    } as any)) as any;

    expect(resp.init?.status).toBe(403);
  });

  it("merges collections and redirects to collection detail", async () => {
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
    const targetCollection = await CollectionService.create({
      name: "Target",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const sourceRun = await RunService.create({
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
    const sourceCollection = await CollectionService.create({
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
        intent: "MERGE_COLLECTIONS",
        payload: { sourceCollectionIds: [sourceCollection._id] },
      }),
    });

    const resp = await action({
      request: req,
      params: { projectId: project._id, collectionId: targetCollection._id },
    } as any);

    expect(resp).toBeInstanceOf(Response);
    expect((resp as Response).headers.get("Location")).toBe(
      `/projects/${project._id}/collections/${targetCollection._id}`,
    );

    const updatedTarget = await CollectionService.findById(
      targetCollection._id,
    );
    expect(updatedTarget!.runs).toContain(sourceRun._id);
  });

  it("merges multiple collections", async () => {
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
    const targetCollection = await CollectionService.create({
      name: "Target",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const run1 = await RunService.create({
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
    const run2 = await RunService.create({
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
    const source1 = await CollectionService.create({
      name: "Source 1",
      project: project._id,
      sessions: [session._id],
      runs: [run1._id],
      annotationType: "PER_UTTERANCE",
    });
    const source2 = await CollectionService.create({
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
        intent: "MERGE_COLLECTIONS",
        payload: { sourceCollectionIds: [source1._id, source2._id] },
      }),
    });

    const resp = await action({
      request: req,
      params: { projectId: project._id, collectionId: targetCollection._id },
    } as any);

    expect(resp).toBeInstanceOf(Response);

    const updatedTarget = await CollectionService.findById(
      targetCollection._id,
    );
    expect(updatedTarget!.runs).toHaveLength(2);
    expect(updatedTarget!.runs).toContain(run1._id);
    expect(updatedTarget!.runs).toContain(run2._id);
  });
});
