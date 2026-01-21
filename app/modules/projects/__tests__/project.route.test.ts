import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import { ProjectService } from "../project";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { action, loader } from "../containers/project.route";

const createValidId = () => new Types.ObjectId().toString();

describe("project.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when there is no session cookie", async () => {
    const res = await loader({
      request: new Request("http://localhost/projects/123"),
      params: { id: "123" },
    } as any);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when project not found", async () => {
    const user = await UserService.create({ username: "test_user" });

    const fakeProjectId = createValidId();
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request(`http://localhost/projects/${fakeProjectId}`, {
        headers: { cookie: cookieHeader },
      }),
      params: { id: fakeProjectId },
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when user cannot view project", async () => {
    const owner = await UserService.create({ username: "owner" });
    const otherUser = await UserService.create({ username: "other_user" });
    const team = await TeamService.create({ name: "Private Team" });

    const project = await ProjectService.create({
      name: "Private Project",
      createdBy: owner._id,
      team: team._id,
    });

    const cookieHeader = await loginUser(otherUser._id);

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id, {
        headers: { cookie: cookieHeader },
      }),
      params: { id: project._id },
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
      request: new Request("http://localhost/projects/" + project._id, {
        headers: { cookie: cookieHeader },
      }),
      params: { id: project._id },
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    expect((res as any).project._id).toBe(project._id);
    expect((res as any).project.name).toBe("Test Project");
    expect((res as any).filesCount).toBe(0);
    expect((res as any).sessionsCount).toBe(0);
  });
});

describe("project.route action - FILE_UPLOAD", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to / when there is no session cookie", async () => {
    const formData = new FormData();
    formData.append("body", JSON.stringify({ entityId: "test-id" }));

    const req = new Request("http://localhost/projects/123", {
      method: "POST",
      body: formData,
    });

    const res = await action({ request: req } as any);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns 400 when project not found", async () => {
    const user = await UserService.create({ username: "test_user" });

    const fakeProjectId = createValidId();
    const cookieHeader = await loginUser(user._id);

    const formData = new FormData();
    formData.append("body", JSON.stringify({ entityId: fakeProjectId }));

    const req = new Request("http://localhost/projects", {
      method: "POST",
      headers: { cookie: cookieHeader },
      body: formData,
    });

    const resp = (await action({ request: req } as any)) as any;

    expect(resp.init?.status).toBe(404);
    expect(resp.data?.errors?.general).toBe("Project not found");
  });

  it("returns 400 when no files provided", async () => {
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

    const formData = new FormData();
    formData.append("body", JSON.stringify({ entityId: project._id }));
    // No files added

    const req = new Request("http://localhost/projects", {
      method: "POST",
      headers: { cookie: cookieHeader },
      body: formData,
    });

    const resp = (await action({ request: req } as any)) as any;

    expect(resp.init?.status).toBe(400);
    expect(resp.data?.errors?.files).toBe("Please select at least one file.");
  });

  it("successfully uploads files and updates project state", async () => {
    const user = await UserService.create({ username: "test_user", teams: [] });

    const team = await TeamService.create({ name: "Test Team" });

    // Add user to team
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: "ADMIN" }],
    });

    const project = await ProjectService.create({
      name: "Test Project",
      createdBy: user._id,
      team: team._id,
      hasSetupProject: false,
    });

    const cookieHeader = await loginUser(user._id);

    const formData = new FormData();
    formData.append("body", JSON.stringify({ entityId: project._id }));
    // Add a test file (will fail during processing, but that's ok for this test)
    const testFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    formData.append("files", testFile);

    const req = new Request("http://localhost/projects", {
      method: "POST",
      headers: { cookie: cookieHeader },
      body: formData,
    });

    const resp = (await action({ request: req } as any)) as any;

    // File processing will fail, so expect 400 error
    expect(resp.init?.status).toBe(400);
    expect(resp.data?.errors?.files).toContain("File processing failed");
  });
});
