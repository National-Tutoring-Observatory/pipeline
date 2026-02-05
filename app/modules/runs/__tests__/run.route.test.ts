import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/run.route";

vi.mock("~/modules/runs/helpers/buildRunSessions.server", () => ({
  default: vi.fn(async (sessionIds: string[]) =>
    sessionIds.map((id) => ({
      sessionId: id,
      name: "Mock Session",
      fileType: "",
      status: "RUNNING",
      startedAt: new Date(),
      finishedAt: new Date(),
    })),
  ),
}));

vi.mock("~/modules/runs/services/buildRunSnapshot.server", () => ({
  default: vi.fn(async ({ promptId, promptVersionNumber, modelCode }: any) => ({
    prompt: {
      name: "Mock Prompt",
      userPrompt: "Mock",
      annotationSchema: [],
      annotationType: "PER_UTTERANCE",
      version: promptVersionNumber,
    },
    model: { code: modelCode, provider: "openai", name: modelCode },
  })),
  buildRunSnapshot: vi.fn(),
}));

vi.mock("~/modules/runs/services/createRunAnnotations.server", () => ({
  default: vi.fn(async () => {}),
}));

describe("run.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when run not found", async () => {
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
    const fakeRunId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" + project._id + "/runs/" + fakeRunId,
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: project._id, runId: fakeRunId },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns run data with promptInfo from snapshot", async () => {
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

    const run = await RunService.create({
      project: project._id,
      name: "Test Run",
      sessions: [],
      annotationType: "PER_UTTERANCE",
      prompt: new Types.ObjectId().toString(),
      promptVersion: 1,
      modelCode: "gpt-4",
    });

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" + project._id + "/runs/" + run._id,
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: project._id, runId: run._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const loaderData = res as any;
    expect(loaderData.promptInfo).toBeDefined();
    expect(loaderData.promptInfo.name).toBe("Mock Prompt");
    expect(loaderData.promptInfo.version).toBe(1);
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

    const run = await RunService.create({
      project: project._id,
      name: "Test Run",
      sessions: [],
      annotationType: "PER_UTTERANCE",
      prompt: new Types.ObjectId().toString(),
      promptVersion: 1,
      modelCode: "gpt-4",
    });

    const cookieHeader = await loginUser(otherUser._id);

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" + project._id + "/runs/" + run._id,
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: project._id, runId: run._id },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });
});
