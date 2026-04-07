import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { action, loader } from "../containers/createRun.route";

describe("createRun.route action - CREATE_AND_START_RUN validation", () => {
  let cookieHeader: string;
  let projectId: string;

  beforeEach(async () => {
    await clearDocumentDB();

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
    projectId = project._id;
    cookieHeader = await loginUser(user._id);
  });

  const makeRequest = (payload: object) =>
    new Request("http://localhost/", {
      method: "POST",
      headers: { cookie: cookieHeader, "content-type": "application/json" },
      body: JSON.stringify({ intent: "CREATE_AND_START_RUN", payload }),
    });

  it("returns 403 when user does not belong to the project team", async () => {
    const otherUser = await UserService.create({
      username: "other_user",
      teams: [],
    });
    const otherCookie = await loginUser(otherUser._id);

    const res = await action({
      request: new Request("http://localhost/", {
        method: "POST",
        headers: { cookie: otherCookie, "content-type": "application/json" },
        body: JSON.stringify({
          intent: "CREATE_AND_START_RUN",
          payload: {
            name: "Valid Run Name",
            annotationType: "PER_UTTERANCE",
            prompt: new Types.ObjectId().toString(),
            promptVersion: 1,
            model: "gpt-4o",
            sessions: [new Types.ObjectId().toString()],
          },
        }),
      }),
      params: { projectId },
    } as any);

    expect((res as any).data.errors.project).toBeDefined();
  });

  it("returns errors when name is missing", async () => {
    const res = await action({
      request: makeRequest({
        annotationType: "PER_UTTERANCE",
        prompt: new Types.ObjectId().toString(),
        promptVersion: 1,
        model: "gpt-4o",
        sessions: [new Types.ObjectId().toString()],
      }),
      params: { projectId },
    } as any);

    expect((res as any).data.errors.name).toBeDefined();
  });

  it("returns errors when name is whitespace only", async () => {
    const res = await action({
      request: makeRequest({
        name: "   ",
        annotationType: "PER_UTTERANCE",
        prompt: new Types.ObjectId().toString(),
        promptVersion: 1,
        model: "gpt-4o",
        sessions: [new Types.ObjectId().toString()],
      }),
      params: { projectId },
    } as any);

    expect((res as any).data.errors.name).toBeDefined();
  });

  it("returns errors when name is shorter than 3 characters", async () => {
    const res = await action({
      request: makeRequest({
        name: "ab",
        annotationType: "PER_UTTERANCE",
        prompt: new Types.ObjectId().toString(),
        promptVersion: 1,
        model: "gpt-4o",
        sessions: [new Types.ObjectId().toString()],
      }),
      params: { projectId },
    } as any);

    expect((res as any).data.errors.name).toBeDefined();
  });

  it("returns errors when sessions are missing", async () => {
    const res = await action({
      request: makeRequest({
        name: "Valid Run Name",
        annotationType: "PER_UTTERANCE",
        prompt: new Types.ObjectId().toString(),
        promptVersion: 1,
        model: "gpt-4o",
        sessions: [],
      }),
      params: { projectId },
    } as any);

    expect((res as any).data.errors.sessions).toBeDefined();
  });

  it("returns errors when prompt is missing", async () => {
    const res = await action({
      request: makeRequest({
        name: "Valid Run Name",
        annotationType: "PER_UTTERANCE",
        promptVersion: 1,
        model: "gpt-4o",
        sessions: [new Types.ObjectId().toString()],
      }),
      params: { projectId },
    } as any);

    expect((res as any).data.errors.prompt).toBeDefined();
  });
});

describe("createRun.route loader", () => {
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
