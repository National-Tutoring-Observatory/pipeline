import { beforeEach, describe, expect, it } from "vitest";
import { CollectionService } from "~/modules/collections/collection";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import createTestRun from "../../../../test/helpers/createTestRun";
import loginUser from "../../../../test/helpers/loginUser";
import { ProjectService } from "../../projects/project";
import { action } from "../containers/runAddToCollection.route";

describe("runAddToCollection.route action - ADD_TO_COLLECTIONS", () => {
  let user: any;
  let team: any;
  let project: any;
  let run: any;
  let collection: any;
  let cookieHeader: string;

  beforeEach(async () => {
    await clearDocumentDB();

    user = await UserService.create({ username: "test_user", teams: [] });
    team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });

    project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });

    run = await createTestRun({
      name: "Test Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [],
    });

    collection = await CollectionService.create({
      name: "Test Collection",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [],
      runs: [],
    });

    cookieHeader = await loginUser(user._id);
  });

  it("adds run to multiple collections successfully", async () => {
    const collection2 = await CollectionService.create({
      name: "Test Collection 2",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      sessions: [],
      runs: [],
    });

    const req = new Request(
      `http://localhost/projects/${project._id}/runs/${run._id}/add-to-collection`,
      {
        method: "POST",
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "ADD_TO_COLLECTIONS",
          payload: { collectionIds: [collection._id, collection2._id] },
        }),
      },
    );

    const resp = (await action({
      request: req,
      params: { projectId: project._id, runId: run._id },
    } as any)) as any;

    expect(resp).not.toBeInstanceOf(Response);
    expect(resp.data.success).toBe(true);
    expect(resp.data.intent).toBe("ADD_TO_COLLECTIONS");
    expect(resp.data.data.count).toBe(2);

    const updatedCollection1 = await CollectionService.findById(collection._id);
    const updatedCollection2 = await CollectionService.findById(
      collection2._id,
    );

    expect(updatedCollection1?.runs).toContain(run._id);
    expect(updatedCollection2?.runs).toContain(run._id);
  });

  it("adds run to single collection successfully", async () => {
    const req = new Request(
      `http://localhost/projects/${project._id}/runs/${run._id}/add-to-collection`,
      {
        method: "POST",
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "ADD_TO_COLLECTIONS",
          payload: { collectionIds: [collection._id] },
        }),
      },
    );

    const resp = (await action({
      request: req,
      params: { projectId: project._id, runId: run._id },
    } as any)) as any;

    expect(resp).not.toBeInstanceOf(Response);
    expect(resp.data.success).toBe(true);
    expect(resp.data.data.count).toBe(1);

    const updatedCollection = await CollectionService.findById(collection._id);
    expect(updatedCollection?.runs).toContain(run._id);
  });

  it("returns 403 when user lacks permission to manage runs", async () => {
    const otherUser = await UserService.create({
      username: "other_user",
      teams: [],
    });
    const otherTeam = await TeamService.create({ name: "Other Team" });
    await UserService.updateById(otherUser._id, {
      teams: [{ team: otherTeam._id, role: "MEMBER" }],
    });

    const otherCookieHeader = await loginUser(otherUser._id);

    const req = new Request(
      `http://localhost/projects/${project._id}/runs/${run._id}/add-to-collection`,
      {
        method: "POST",
        headers: {
          cookie: otherCookieHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          intent: "ADD_TO_COLLECTIONS",
          payload: { collectionIds: [collection._id] },
        }),
      },
    );

    const resp = (await action({
      request: req,
      params: { projectId: project._id, runId: run._id },
    } as any)) as any;

    expect(resp.init?.status).toBe(403);
    expect(resp.data.errors.project).toBe("Access denied");
  });
});

describe("runAddToCollection.route action - CREATE_COLLECTION", () => {
  let user: any;
  let team: any;
  let project: any;
  let run: any;
  let cookieHeader: string;

  beforeEach(async () => {
    await clearDocumentDB();

    user = await UserService.create({ username: "test_user", teams: [] });
    team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });

    project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });

    run = await createTestRun({
      name: "Test Run",
      project: project._id,
      isRunning: false,
      isComplete: false,
    });

    cookieHeader = await loginUser(user._id);
  });

  it("creates collection for run successfully", async () => {
    const req = new Request(
      `http://localhost/projects/${project._id}/runs/${run._id}/add-to-collection`,
      {
        method: "POST",
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "CREATE_COLLECTION",
          payload: { name: "Test Collection" },
        }),
      },
    );

    const resp = (await action({
      request: req,
      params: { projectId: project._id, runId: run._id },
    } as any)) as any;

    expect(resp).not.toBeInstanceOf(Response);
    expect(resp.data.success).toBe(true);
    expect(resp.data.intent).toBe("CREATE_COLLECTION");
    expect(resp.data.data.redirectTo).toContain("/collections/");

    const collection = await CollectionService.findById(
      resp.data.data.redirectTo.split("/").pop(),
    );
    expect(collection?.name).toBe("Test Collection");
    expect(collection?.runs).toContain(run._id);
  });

  it("returns 400 when name is too short", async () => {
    const req = new Request(
      `http://localhost/projects/${project._id}/runs/${run._id}/add-to-collection`,
      {
        method: "POST",
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "CREATE_COLLECTION",
          payload: { name: "ab" },
        }),
      },
    );

    const resp = (await action({
      request: req,
      params: { projectId: project._id, runId: run._id },
    } as any)) as any;

    expect(resp.init?.status).toBe(400);
    expect(resp.data.errors.name).toBe(
      "Collection name must be at least 3 characters",
    );
  });

  it("returns 403 when user lacks permission", async () => {
    const otherUser = await UserService.create({
      username: "other_user",
      teams: [],
    });
    const otherTeam = await TeamService.create({ name: "Other Team" });
    await UserService.updateById(otherUser._id, {
      teams: [{ team: otherTeam._id, role: "ADMIN" }],
    });

    const otherCookieHeader = await loginUser(otherUser._id);

    const req = new Request(
      `http://localhost/projects/${project._id}/runs/${run._id}/add-to-collection`,
      {
        method: "POST",
        headers: {
          cookie: otherCookieHeader,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          intent: "CREATE_COLLECTION",
          payload: { name: "Test Collection" },
        }),
      },
    );

    const resp = (await action({
      request: req,
      params: { projectId: project._id, runId: run._id },
    } as any)) as any;

    expect(resp.init?.status).toBe(403);
    expect(resp.data.errors.project).toBe("Access denied");
  });

  it("redirects to / when user not authenticated", async () => {
    const req = new Request(
      `http://localhost/projects/${project._id}/runs/${run._id}/add-to-collection`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          intent: "CREATE_COLLECTION",
          payload: { name: "Test Collection" },
        }),
      },
    );

    const resp = await action({
      request: req,
      params: { projectId: project._id, runId: run._id },
    } as any);

    expect(resp).toBeInstanceOf(Response);
    expect((resp as Response).headers.get("Location")).toBe("/");
  });
});
