import { beforeEach, describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { UserService } from "~/modules/users/user";
import { TeamService } from "~/modules/teams/team";
import { ProjectService } from "~/modules/projects/project";
import { CollectionService } from "~/modules/collections/collection";
import { RunService } from "~/modules/runs/run";
import { SessionService } from "~/modules/sessions/session";
import { FeatureFlagService } from "~/modules/featureFlags/featureFlag";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { loader, action } from "../containers/collectionAddRuns.route";

beforeEach(async () => {
  await clearDocumentDB();
  await FeatureFlagService.create({ name: "HAS_PROJECT_COLLECTIONS" });
});

describe("collectionAddRuns.route loader", () => {
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

  it("returns eligible runs for collection", async () => {
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
      name: "Test Collection",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const eligibleRun = await RunService.create({
      name: "Eligible Run",
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
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: { projectId: project._id, collectionId: collection._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as any;
    expect(data.eligibleRuns).toHaveLength(1);
    expect(data.eligibleRuns[0]._id).toBe(eligibleRun._id);
  });

  it("excludes runs already in collection", async () => {
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
    const existingRun = await RunService.create({
      name: "Existing Run",
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
    const collection = await CollectionService.create({
      name: "Test Collection",
      project: project._id,
      sessions: [session._id],
      runs: [existingRun._id],
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
    expect(data.eligibleRuns).toHaveLength(0);
  });
});

describe("collectionAddRuns.route action", () => {
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
      name: "Test Collection",
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
        intent: "ADD_RUNS",
        payload: { runIds: ["any"] },
      }),
    });

    const resp = (await action({
      request: req,
      params: { projectId: project._id, collectionId: collection._id },
    } as any)) as any;

    expect(resp.init?.status).toBe(403);
  });

  it("adds runs and redirects to collection detail", async () => {
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
      name: "Test Collection",
      project: project._id,
      sessions: [session._id],
      runs: [],
      annotationType: "PER_UTTERANCE",
    });
    const run = await RunService.create({
      name: "Test Run",
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
    const cookieHeader = await loginUser(user._id);

    const req = new Request("http://localhost/", {
      method: "POST",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      body: JSON.stringify({
        intent: "ADD_RUNS",
        payload: { runIds: [run._id] },
      }),
    });

    const resp = await action({
      request: req,
      params: { projectId: project._id, collectionId: collection._id },
    } as any);

    expect(resp).toBeInstanceOf(Response);
    expect((resp as Response).headers.get("Location")).toBe(
      `/projects/${project._id}/collections/${collection._id}`,
    );

    const updatedCollection = await CollectionService.findById(collection._id);
    expect(updatedCollection!.runs).toContain(run._id);
  });
});
