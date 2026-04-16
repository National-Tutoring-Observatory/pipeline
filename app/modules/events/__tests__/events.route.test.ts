import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectService } from "~/modules/projects/project";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import expectAuthRequired from "../../../../test/helpers/expectAuthRequired";
import loginUser from "../../../../test/helpers/loginUser";
import { loader } from "../containers/events.route";
import { emitter } from "../emitter";

vi.spyOn(console, "log").mockImplementation(() => {});

async function drainStream(
  reader: ReadableStreamDefaultReader<any>,
): Promise<string[]> {
  const chunks: string[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(
          typeof value === "string" ? value : new TextDecoder().decode(value),
        );
      }
    }
  } catch {
    // stream canceled
  }
  return chunks;
}

describe("events.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when unauthenticated", async () => {
    await expectAuthRequired(() =>
      loader({
        request: new Request("http://localhost/api/events"),
        params: {},
      } as any),
    );
  });

  it("only forwards UPLOAD_FILES events for the user's own projects", async () => {
    const teamA = await TeamService.create({ name: "Team A" });
    const teamB = await TeamService.create({ name: "Team B" });
    const user = await UserService.create({
      username: "user",
      teams: [{ team: teamA._id, role: "MEMBER" }],
    });
    const projectA = await ProjectService.create({
      name: "Project A",
      createdBy: user._id,
      team: teamA._id,
    });
    const projectB = await ProjectService.create({
      name: "Project B",
      createdBy: user._id,
      team: teamB._id,
    });

    const cookieHeader = await loginUser(user._id);
    const abortController = new AbortController();

    const response = await loader({
      request: new Request("http://localhost/api/events", {
        headers: { cookie: cookieHeader },
        signal: abortController.signal,
      }),
      params: {},
    } as any);

    const reader = (response as Response).body!.getReader();

    emitter.emit("UPLOAD_FILES", {
      projectId: projectA._id,
      progress: 50,
      status: "RUNNING",
    });
    emitter.emit("UPLOAD_FILES", {
      projectId: projectB._id,
      progress: 50,
      status: "RUNNING",
    });

    abortController.abort();
    const chunks = await drainStream(reader);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain(projectA._id);
    expect(chunks[0]).not.toContain(projectB._id);
  });

  it("only forwards ANNOTATE_RUN_SESSION events for the user's own projects", async () => {
    const teamA = await TeamService.create({ name: "Team A" });
    const teamB = await TeamService.create({ name: "Team B" });
    const user = await UserService.create({
      username: "user",
      teams: [{ team: teamA._id, role: "MEMBER" }],
    });
    const projectA = await ProjectService.create({
      name: "Project A",
      createdBy: user._id,
      team: teamA._id,
    });
    const projectB = await ProjectService.create({
      name: "Project B",
      createdBy: user._id,
      team: teamB._id,
    });

    const cookieHeader = await loginUser(user._id);
    const abortController = new AbortController();

    const response = await loader({
      request: new Request("http://localhost/api/events", {
        headers: { cookie: cookieHeader },
        signal: abortController.signal,
      }),
      params: {},
    } as any);

    const reader = (response as Response).body!.getReader();

    emitter.emit("ANNOTATE_RUN_SESSION", {
      runId: "run-allowed",
      projectId: projectA._id,
      progress: 50,
      status: "RUNNING",
    });
    emitter.emit("ANNOTATE_RUN_SESSION", {
      runId: "run-blocked",
      projectId: projectB._id,
      progress: 50,
      status: "RUNNING",
    });

    abortController.abort();
    const chunks = await drainStream(reader);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toContain("run-allowed");
    expect(chunks[0]).not.toContain("run-blocked");
  });

  it("super admin receives events for all projects", async () => {
    const teamA = await TeamService.create({ name: "Team A" });
    const teamB = await TeamService.create({ name: "Team B" });
    const admin = await UserService.create({
      username: "admin",
      role: "SUPER_ADMIN",
      teams: [],
    });
    const projectA = await ProjectService.create({
      name: "Project A",
      createdBy: admin._id,
      team: teamA._id,
    });
    const projectB = await ProjectService.create({
      name: "Project B",
      createdBy: admin._id,
      team: teamB._id,
    });

    const cookieHeader = await loginUser(admin._id);
    const abortController = new AbortController();

    const response = await loader({
      request: new Request("http://localhost/api/events", {
        headers: { cookie: cookieHeader },
        signal: abortController.signal,
      }),
      params: {},
    } as any);

    const reader = (response as Response).body!.getReader();

    emitter.emit("UPLOAD_FILES", {
      projectId: projectA._id,
      progress: 50,
      status: "RUNNING",
    });
    emitter.emit("UPLOAD_FILES", {
      projectId: projectB._id,
      progress: 50,
      status: "RUNNING",
    });

    abortController.abort();
    const chunks = await drainStream(reader);

    expect(chunks).toHaveLength(2);
  });
});
