import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import { ProjectService } from "../project";
import { RunService } from "~/modules/runs/run";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from "../containers/projectRun.route";

describe("projectRun.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("redirects to / when run not found", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });

    const cookieHeader = await loginUser(user._id);
    const fakeRunId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id + "/runs/" + fakeRunId, { headers: { cookie: cookieHeader } }),
      params: { projectId: project._id, runId: fakeRunId }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to create-run when run does not have setup", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });

    const run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      isRunning: false,
      isComplete: false,
      hasSetup: false
    });

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id + "/runs/" + run._id, { headers: { cookie: cookieHeader } }),
      params: { projectId: project._id, runId: run._id }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe(`/projects/${project._id}/create-run`);
  });

  it("returns run data for authorized users", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });

    const prompt = await PromptService.create({
      name: 'Test Prompt',
      team: team._id
    });

    const promptVersion = await PromptVersionService.create({
      name: 'v1',
      prompt: prompt._id,
      version: 1,
      userPrompt: 'Test prompt',
      annotationSchema: []
    });

    const run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      isRunning: false,
      isComplete: false,
      hasSetup: true,
      prompt: prompt._id,
      promptVersion: 1
    });

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id + "/runs/" + run._id, { headers: { cookie: cookieHeader } }),
      params: { projectId: project._id, runId: run._id }
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const loaderData = res as any;
    // Ensure project is unwrapped, not { data: ... }
    expect(loaderData.project._id).toBe(project._id);
    expect(loaderData.project.name).toBe('Test Project');
    expect(loaderData.project.data).toBeUndefined();
    // Ensure run is unwrapped
    expect(loaderData.run._id).toBe(run._id);
    expect(loaderData.run.name).toBe('Test Run');
    expect(loaderData.run.data).toBeUndefined();
    // Ensure prompt is unwrapped
    expect(loaderData.runPrompt._id).toBe(prompt._id);
    expect(loaderData.runPrompt.data).toBeUndefined();
  });

  it("redirects to / when user is not in project team", async () => {
    const owner = await UserService.create({ username: 'owner', teams: [] });
    const otherUser = await UserService.create({ username: 'other_user', teams: [] });
    const team = await TeamService.create({ name: 'Private Team' });

    await UserService.updateById(owner._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Private Project',
      createdBy: owner._id,
      team: team._id
    });

    const run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      isRunning: false,
      isComplete: false,
      hasSetup: true
    });

    const cookieHeader = await loginUser(otherUser._id);

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id + "/runs/" + run._id, { headers: { cookie: cookieHeader } }),
      params: { projectId: project._id, runId: run._id }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });
});
