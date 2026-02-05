import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import createTestRun from "../../../../test/helpers/createTestRun";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/runSessions.route";

// Mock storage adapter to avoid actual file operations
vi.mock("~/modules/storage/helpers/getStorageAdapter", () => ({
  default: () => ({
    download: vi.fn().mockResolvedValue("/tmp/mocked-path"),
  }),
}));

// Mock fse to avoid actual file operations
vi.mock("fs-extra", () => ({
  default: {
    readJSON: vi.fn().mockResolvedValue({
      utterances: [],
    }),
  },
}));

describe("runSessions.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when project not found", async () => {
    const user = await UserService.create({ username: "test_user" });
    const cookieHeader = await loginUser(user._id);
    const fakeProjectId = new Types.ObjectId().toString();
    const fakeRunId = new Types.ObjectId().toString();
    const fakeSessionId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" +
          fakeProjectId +
          "/runs/" +
          fakeRunId +
          "/sessions/" +
          fakeSessionId,
        { headers: { cookie: cookieHeader } },
      ),
      params: {
        projectId: fakeProjectId,
        runId: fakeRunId,
        sessionId: fakeSessionId,
      },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
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
    const fakeSessionId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" +
          project._id +
          "/runs/" +
          fakeRunId +
          "/sessions/" +
          fakeSessionId,
        { headers: { cookie: cookieHeader } },
      ),
      params: {
        projectId: project._id,
        runId: fakeRunId,
        sessionId: fakeSessionId,
      },
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

    const run = await createTestRun({
      name: "Test Run",
      project: project._id,
      isRunning: false,
      isComplete: false,
      sessions: [],
    });

    const cookieHeader = await loginUser(otherUser._id);

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" +
          project._id +
          "/runs/" +
          run._id +
          "/sessions/invalid",
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: project._id, runId: run._id, sessionId: "invalid" },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns run and project data for authorized users", async () => {
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

    const sessionId = new Types.ObjectId().toString();
    const run = await createTestRun({
      name: "Test Run",
      project: project._id,
      isRunning: false,
      isComplete: false,
      sessions: [
        {
          sessionId,
          name: "test_session.json",
          fileType: "json",
          status: "DONE",
          startedAt: new Date(),
          finishedAt: new Date(),
        },
      ],
    });

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request(
        "http://localhost/projects/" +
          project._id +
          "/runs/" +
          run._id +
          "/sessions/" +
          sessionId,
        { headers: { cookie: cookieHeader } },
      ),
      params: { projectId: project._id, runId: run._id, sessionId },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const loaderData = res as any;
    // Ensure project is unwrapped, not { data: ... }
    expect(loaderData.project._id).toBe(project._id);
    expect(loaderData.project.name).toBe("Test Project");
    expect(loaderData.project.data).toBeUndefined();
    // Ensure run is unwrapped
    expect(loaderData.run._id).toBe(run._id);
    expect(loaderData.run.name).toBe("Test Run");
    expect(loaderData.run.data).toBeUndefined();
  });
});
