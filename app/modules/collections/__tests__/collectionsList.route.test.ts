import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/teams/team";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";
import { ProjectService } from "~/modules/projects/project";
import { CollectionService } from "~/modules/collections/collection";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader, action } from "../containers/collectionsList.route";

describe("collectionsList.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("redirects to / when project not found", async () => {
    const user = await UserService.create({ username: 'test_user' });
    const cookieHeader = await loginUser(user._id);
    const fakeProjectId = new Types.ObjectId().toString();

    const res = await loader({
      request: new Request("http://localhost/projects/" + fakeProjectId + "/collections", { headers: { cookie: cookieHeader } }),
      params: { id: fakeProjectId }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns collections for authorized users", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id + "/collections", { headers: { cookie: cookieHeader } }),
      params: { id: project._id }
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const loaderData = res as any;
    expect(loaderData.collections.data).toEqual([]);
    expect(loaderData.collections.totalPages).toBeDefined();
  });

  it("redirects to / when user cannot view project", async () => {
    const owner = await UserService.create({ username: 'owner', teams: [] });
    const otherUser = await UserService.create({ username: 'other_user', teams: [] });
    const team = await TeamService.create({ name: 'Private Team' });

    await UserService.updateById(owner._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Private Project',
      createdBy: owner._id,
      team: team._id
    });

    const cookieHeader = await loginUser(otherUser._id);

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id + "/collections", { headers: { cookie: cookieHeader } }),
      params: { id: project._id }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });
});

describe("collectionsList.route action - CREATE_COLLECTION", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("returns 403 when user cannot manage project", async () => {
    const owner = await UserService.create({ username: 'owner', teams: [] });
    const otherUser = await UserService.create({ username: 'other_user', teams: [] });
    const team = await TeamService.create({ name: 'Private Team' });

    await UserService.updateById(owner._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Private Project',
      createdBy: owner._id,
      team: team._id
    });

    const cookieHeader = await loginUser(otherUser._id);

    const req = new Request('http://localhost/projects/' + project._id + '/collections', {
      method: 'POST',
      headers: { cookie: cookieHeader, 'content-type': 'application/json' },
      body: JSON.stringify({ intent: 'CREATE_COLLECTION', payload: { name: 'Test Collection' } })
    });

    const resp = await action({ request: req, params: { id: project._id } } as any) as any;
    expect(resp.init?.status).toBe(403);
    expect(resp.data?.errors?.project).toBe('Access denied');
  });

  it("creates collection successfully", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });

    const cookieHeader = await loginUser(user._id);

    const req = new Request('http://localhost/projects/' + project._id + '/collections', {
      method: 'POST',
      headers: { cookie: cookieHeader, 'content-type': 'application/json' },
      body: JSON.stringify({ intent: 'CREATE_COLLECTION', payload: { name: 'Test Collection' } })
    });

    const resp = await action({ request: req, params: { id: project._id } } as any) as any;

    expect(resp).not.toBeInstanceOf(Response);
    expect(resp.intent).toBe('CREATE_COLLECTION');
    expect(resp._id).toBeDefined();
    expect(resp.name).toBe('Test Collection');
    expect(resp.project).toBe(project._id);
  });
});

describe("collectionsList.route action - DELETE_COLLECTION", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("returns 403 when user cannot manage project", async () => {
    const owner = await UserService.create({ username: 'owner', teams: [] });
    const otherUser = await UserService.create({ username: 'other_user', teams: [] });
    const team = await TeamService.create({ name: 'Private Team' });

    await UserService.updateById(owner._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Private Project',
      createdBy: owner._id,
      team: team._id
    });

    const collection = await CollectionService.create({
      name: 'Test Collection',
      project: project._id,
      sessions: [],
      runs: []
    });

    const cookieHeader = await loginUser(otherUser._id);

    const req = new Request('http://localhost/projects/' + project._id + '/collections', {
      method: 'DELETE',
      headers: { cookie: cookieHeader, 'content-type': 'application/json' },
      body: JSON.stringify({ intent: 'DELETE_COLLECTION', entityId: collection._id })
    });

    const resp = await action({ request: req, params: { id: project._id } } as any) as any;
    expect(resp.init?.status).toBe(403);
    expect(resp.data?.errors?.project).toBe('Access denied');
  });

  it("deletes collection successfully", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });

    const collection = await CollectionService.create({
      name: 'Test Collection',
      project: project._id,
      sessions: [],
      runs: []
    });

    const cookieHeader = await loginUser(user._id);

    const req = new Request('http://localhost/projects/' + project._id + '/collections', {
      method: 'DELETE',
      headers: { cookie: cookieHeader, 'content-type': 'application/json' },
      body: JSON.stringify({ intent: 'DELETE_COLLECTION', entityId: collection._id })
    });

    const resp = await action({ request: req, params: { id: project._id } } as any) as any;

    expect(resp.intent).toBe('DELETE_COLLECTION');

    const deletedCollection = await CollectionService.findById(collection._id);
    expect(deletedCollection).toBeNull();
  });

  it("throws error when collection not found", async () => {
    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, { teams: [{ team: team._id, role: 'ADMIN' }] });

    const project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });

    const cookieHeader = await loginUser(user._id);
    const fakeCollectionId = new Types.ObjectId().toString();

    const req = new Request('http://localhost/projects/' + project._id + '/collections', {
      method: 'DELETE',
      headers: { cookie: cookieHeader, 'content-type': 'application/json' },
      body: JSON.stringify({ intent: 'DELETE_COLLECTION', entityId: fakeCollectionId })
    });

    await expect(action({ request: req, params: { id: project._id } } as any)).rejects.toThrow('Collection not found');
  });
});

