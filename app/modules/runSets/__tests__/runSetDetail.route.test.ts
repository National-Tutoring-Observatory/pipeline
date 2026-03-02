import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import type { Project } from "~/modules/projects/projects.types";
import type { Run } from "~/modules/runs/runs.types";
import { RunSetService } from "~/modules/runSets/runSet";
import type { RunSet } from "~/modules/runSets/runSets.types";
import { SessionService } from "~/modules/sessions/session";
import type { Session } from "~/modules/sessions/sessions.types";
import { TeamService } from "~/modules/teams/team";
import type { Team } from "~/modules/teams/teams.types";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import createTestRun from "../../../../test/helpers/createTestRun";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/runSetDetail.route";

type LoaderResult = {
  runSet: RunSet;
  project: Project;
};

describe("runSetDetail.route loader", () => {
  let user: User;
  let team: Team;
  let project: Project;
  let runSet: RunSet;
  let session: Session;
  let run: Run;
  let cookieHeader: string;

  beforeEach(async () => {
    await clearDocumentDB();

    user = await UserService.create({
      username: "test_user",
      teams: [],
    });
    team = await TeamService.create({ name: "Test Team" });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
    });
    session = await SessionService.create({
      name: "Test Session",
      project: project._id,
    });
    run = await createTestRun({
      name: "Test Run",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      isRunning: false,
      isComplete: false,
    });
    runSet = await RunSetService.create({
      name: "Test Run Set",
      project: project._id,
      sessions: [session._id],
      runs: [run._id],
      annotationType: "PER_UTTERANCE",
    });

    cookieHeader = await loginUser(user._id);
  });

  it("redirects to / when there is no session", async () => {
    const res = await loader({
      request: new Request("http://localhost/"),
      params: { projectId: project._id, runSetId: runSet._id },
      unstable_pattern: "",
      context: {},
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when project not found", async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: { projectId: fakeId, runSetId: runSet._id },
      unstable_pattern: "",
      context: {},
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when user cannot view project", async () => {
    const otherUser = await UserService.create({
      username: "other_user",
      teams: [],
    });
    const otherCookie = await loginUser(otherUser._id);

    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: otherCookie },
      }),
      params: { projectId: project._id, runSetId: runSet._id },
      unstable_pattern: "",
      context: {},
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to runSets list when runSet not found", async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: { projectId: project._id, runSetId: fakeId },
      unstable_pattern: "",
      context: {},
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe(
      `/projects/${project._id}/run-sets`,
    );
  });

  it("returns runSet and project", async () => {
    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: { projectId: project._id, runSetId: runSet._id },
      unstable_pattern: "",
      context: {},
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as LoaderResult;
    expect(data.runSet._id).toBe(runSet._id);
    expect(data.runSet.name).toBe("Test Run Set");
    expect(data.project._id).toBe(project._id);
  });

  it("returns runSet with multiple runs and sessions", async () => {
    const session2 = await SessionService.create({
      name: "Test Session 2",
      project: project._id,
    });
    const run2 = await createTestRun({
      name: "Test Run 2",
      project: project._id,
      annotationType: "PER_UTTERANCE",
      isRunning: true,
      isComplete: false,
    });

    const multiRunSet = await RunSetService.create({
      name: "Multi RunSet",
      project: project._id,
      sessions: [session._id, session2._id],
      runs: [run._id, run2._id],
      annotationType: "PER_UTTERANCE",
    });

    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: { projectId: project._id, runSetId: multiRunSet._id },
      unstable_pattern: "",
      context: {},
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as LoaderResult;
    expect(data.runSet._id).toBe(multiRunSet._id);
    expect(data.runSet.runs).toHaveLength(2);
    expect(data.runSet.sessions).toHaveLength(2);
  });

  it("returns runSet data in correct format", async () => {
    const res = await loader({
      request: new Request("http://localhost/", {
        headers: { cookie: cookieHeader },
      }),
      params: { projectId: project._id, runSetId: runSet._id },
      unstable_pattern: "",
      context: {},
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as LoaderResult;

    expect(data).toHaveProperty("runSet");
    expect(data).toHaveProperty("project");

    expect(data.runSet).toHaveProperty("_id");
    expect(data.runSet).toHaveProperty("name");
    expect(data.runSet).toHaveProperty("project");
    expect(data.runSet).toHaveProperty("sessions");
    expect(data.runSet).toHaveProperty("runs");
  });
});
