import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import { ProjectService } from "../project";
import type { User } from "~/modules/users/users.types.js";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { action, loader } from "../containers/projects.route";

const createValidId = () => new Types.ObjectId().toString();

describe("projects.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("returns empty projects list when there is no session", async () => {
    const res = await loader({
      request: new Request("http://localhost/projects"),
      params: {},
      context: {}
    } as any);
    expect(res).not.toBeInstanceOf(Response);
    expect((res as any).projects.data).toEqual([]);
    expect((res as any).projects.totalPages).toBe(0);
  });

  it("returns empty projects list when user has no teams", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/projects", { headers: { cookie: cookieHeader } }),
      params: {},
      context: {}
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    expect((res as any).projects.data).toEqual([]);
    expect((res as any).projects.totalPages).toBe(0);
  });

  it("returns projects for user's teams only", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team1 = await TeamService.create({ name: 'Team 1' });
    const team2 = await TeamService.create({ name: 'Team 2' });

    await UserService.updateById(user._id, { teams: [{ team: team1._id, role: 'ADMIN' }] });

    const project1 = await ProjectService.create({
      name: 'Project in Team 1',
      team: team1._id,
      createdBy: user._id
    });

    const project2 = await ProjectService.create({
      name: 'Project in Team 2',
      team: team2._id,
      createdBy: user._id
    });

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/projects", { headers: { cookie: cookieHeader } }),
      params: {},
      context: {}
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    expect((res as any).projects.data).toHaveLength(1);
    expect((res as any).projects.data[0]._id).toBe(project1._id);
  });

  it("supports pagination", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });

    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    // Create 25 projects (more than default page size of 20)
    for (let i = 0; i < 25; i++) {
      await ProjectService.create({
        name: `Project ${i}`,
        team: team._id,
        createdBy: user._id
      });
    }

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/projects", { headers: { cookie: cookieHeader } }),
      params: {},
      context: {}
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    expect((res as any).projects.data).toHaveLength(20);
    expect((res as any).projects.totalPages).toBe(2);
  });
});

describe("projects.route action", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("creates a project with valid data", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });

    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const cookieHeader = await loginUser(user._id);

    const res = await action({
      request: new Request('http://localhost/projects', {
        method: 'POST',
        headers: { cookie: cookieHeader },
        body: JSON.stringify({ intent: 'CREATE_PROJECT', payload: { name: 'New Project', team: team._id } })
      })
    } as any) as any;

    expect(res.data?.success).toBe(true);
    expect(res.data?.intent).toBe('CREATE_PROJECT');
    expect(res.data?.data?.name).toBe('New Project');
    expect(res.data?.data?.team).toBe(team._id);
  });

  it("rejects project creation with empty name", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });

    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const cookieHeader = await loginUser(user._id);

    const res = await action({
      request: new Request('http://localhost/projects', {
        method: 'POST',
        headers: { cookie: cookieHeader },
        body: JSON.stringify({ intent: 'CREATE_PROJECT', payload: { name: '', team: team._id } })
      })
    } as any) as any;

    expect(res.init?.status).toBe(400);
    expect(res.data?.errors?.general).toBe('Project name is required');
  });

  it("rejects project creation without permission", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });

    // User is not in the team
    const cookieHeader = await loginUser(user._id);

    const res = await action({
      request: new Request('http://localhost/projects', {
        method: 'POST',
        headers: { cookie: cookieHeader },
        body: JSON.stringify({ intent: 'CREATE_PROJECT', payload: { name: 'New Project', team: team._id } })
      })
    } as any) as any;

    expect(res.init?.status).toBe(403);
    expect(res.data?.errors?.general).toContain('permission');
  });

  it("updates a project", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });

    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Original Name',
      team: team._id,
      createdBy: user._id
    });

    const cookieHeader = await loginUser(user._id);

    const res = await action({
      request: new Request('http://localhost/projects', {
        method: 'PUT',
        headers: { cookie: cookieHeader },
        body: JSON.stringify({ intent: 'UPDATE_PROJECT', entityId: project._id, payload: { name: 'Updated Name' } })
      })
    } as any) as any;

    expect(res.data?.success).toBe(true);
    expect(res.data?.intent).toBe('UPDATE_PROJECT');
    expect(res.data?.data?.name).toBe('Updated Name');
  });

  it("deletes a project", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });

    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Project to Delete',
      team: team._id,
      createdBy: user._id
    });

    const cookieHeader = await loginUser(user._id);

    const res = await action({
      request: new Request('http://localhost/projects', {
        method: 'DELETE',
        headers: { cookie: cookieHeader },
        body: JSON.stringify({ intent: 'DELETE_PROJECT', entityId: project._id })
      })
    } as any) as any;

    expect(res.data?.success).toBe(true);
    expect(res.data?.intent).toBe('DELETE_PROJECT');
  });

  it("rejects update without permission", async () => {
    const owner = await UserService.create({ username: 'owner', teams: [] });
    const other = await UserService.create({ username: 'other', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });

    await UserService.updateById(owner._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Project',
      team: team._id,
      createdBy: owner._id
    });

    const cookieHeader = await loginUser(other._id);

    const res = await action({
      request: new Request('http://localhost/projects', {
        method: 'PUT',
        headers: { cookie: cookieHeader },
        body: JSON.stringify({ intent: 'UPDATE_PROJECT', entityId: project._id, payload: { name: 'Updated' } })
      })
    } as any) as any;

    expect(res.init?.status).toBe(403);
    expect(res.data?.errors?.general).toContain('permission');
  });
});
