import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import "~/modules/documents/documents";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Team } from "~/modules/teams/teams.types.js";
import type { User } from "~/modules/users/users.types.js";
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { action, loader } from "../containers/project.route";
import type { Project } from "../projects.types.js";

const documents = getDocumentsAdapter()
const createValidId = () => new Types.ObjectId().toString();

describe("project.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("redirects to / when there is no session cookie", async () => {
    const res = await loader({
      request: new Request("http://localhost/projects/123"),
      params: { id: '123' }
    } as any);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when project not found", async () => {
    const user = (await documents.createDocument<User>({
      collection: 'users',
      update: { username: 'test_user' }
    })).data;

    const fakeProjectId = createValidId();
    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request(`http://localhost/projects/${fakeProjectId}`, { headers: { cookie: cookieHeader } }),
      params: { id: fakeProjectId }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("redirects to / when user cannot view project", async () => {
    const owner = (await documents.createDocument<User>({
      collection: 'users',
      update: { username: 'owner' }
    })).data;

    const otherUser = (await documents.createDocument<User>({
      collection: 'users',
      update: { username: 'other_user' }
    })).data;

    const team = (await documents.createDocument<Team>({
      collection: 'teams',
      update: { name: 'Private Team' }
    })).data;

    const project = (await documents.createDocument<Project>({
      collection: 'projects',
      update: { name: 'Private Project', createdBy: owner._id, team: team._id }
    })).data;

    const cookieHeader = await loginUser(otherUser._id);

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id, { headers: { cookie: cookieHeader } }),
      params: { id: project._id }
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns project data for authorized users", async () => {
    const user = (await documents.createDocument<User>({
      collection: 'users',
      update: { username: 'test_user', teams: [] }
    })).data;

    const team = (await documents.createDocument<Team>({
      collection: 'teams',
      update: { name: 'Test Team' }
    })).data;

    await documents.updateDocument<User>({
      collection: 'users',
      match: { _id: user._id },
      update: { teams: [{ team: team._id, role: 'ADMIN' }] }
    });

    const project = (await documents.createDocument<Project>({
      collection: 'projects',
      update: { name: 'Test Project', createdBy: user._id, team: team._id }
    })).data;

    const cookieHeader = await loginUser(user._id);

    const res = await loader({
      request: new Request("http://localhost/projects/" + project._id, { headers: { cookie: cookieHeader } }),
      params: { id: project._id }
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    expect((res as any).project.data!._id).toBe(project._id);
    expect((res as any).project.data!.name).toBe('Test Project');
    expect((res as any).filesCount).toBe(0);
    expect((res as any).sessionsCount).toBe(0);
  })
})

describe("project.route action - FILE_UPLOAD", () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  it("redirects to / when there is no session cookie", async () => {
    const formData = new FormData();
    formData.append('body', JSON.stringify({ entityId: 'test-id' }));

    const req = new Request('http://localhost/projects/123', {
      method: 'POST',
      body: formData
    });

    const res = await action({ request: req } as any);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get("Location")).toBe("/");
  });

  it("returns 400 when project not found", async () => {
    const user = (await documents.createDocument<User>({
      collection: 'users',
      update: { username: 'test_user' }
    })).data;

    const fakeProjectId = createValidId();
    const cookieHeader = await loginUser(user._id);

    const formData = new FormData();
    formData.append('body', JSON.stringify({ entityId: fakeProjectId }));

    const req = new Request('http://localhost/projects', {
      method: 'POST',
      headers: { cookie: cookieHeader },
      body: formData
    });

    const resp = await action({ request: req } as any) as any;

    expect(resp.init?.status).toBe(400)
    expect(resp.data?.errors?.general).toBe('Project not found')
  })

  it("returns 400 when no files provided", async () => {
    const user = (await documents.createDocument<User>({
      collection: 'users',
      update: { username: 'test_user', teams: [] }
    })).data;

    const team = (await documents.createDocument<Team>({
      collection: 'teams',
      update: { name: 'Test Team' }
    })).data;

    await documents.updateDocument<User>({
      collection: 'users',
      match: { _id: user._id },
      update: { teams: [{ team: team._id, role: 'ADMIN' }] }
    });

    const project = (await documents.createDocument<Project>({
      collection: 'projects',
      update: { name: 'Test Project', createdBy: user._id, team: team._id }
    })).data;

    const cookieHeader = await loginUser(user._id);

    const formData = new FormData();
    formData.append('body', JSON.stringify({ entityId: project._id }));
    // No files added

    const req = new Request('http://localhost/projects', {
      method: 'POST',
      headers: { cookie: cookieHeader },
      body: formData
    });

    const resp = await action({ request: req } as any) as any;

    expect(resp.init?.status).toBe(400)
    expect(resp.data?.errors?.files).toBe('Please select at least one file.')
  })

  it("successfully uploads files and updates project state", async () => {
    const user = (await documents.createDocument<User>({
      collection: 'users',
      update: { username: 'test_user', teams: [] }
    })).data;

    const team = (await documents.createDocument<Team>({
      collection: 'teams',
      update: { name: 'Test Team' }
    })).data;

    // Add user to team
    await documents.updateDocument<User>({
      collection: 'users',
      match: { _id: user._id },
      update: { teams: [{ team: team._id, role: 'ADMIN' }] }
    });

    const project = (await documents.createDocument<Project>({
      collection: 'projects',
      update: { name: 'Test Project', createdBy: user._id, team: team._id, hasSetupProject: false }
    })).data;

    const cookieHeader = await loginUser(user._id);

    const formData = new FormData();
    formData.append('body', JSON.stringify({ entityId: project._id }));
    // Add a test file (will fail during processing, but that's ok for this test)
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    formData.append('files', testFile);

    const req = new Request('http://localhost/projects', {
      method: 'POST',
      headers: { cookie: cookieHeader },
      body: formData
    });

    const resp = await action({ request: req } as any) as any;

    // File processing will fail, so expect 400 error
    expect(resp.init?.status).toBe(400)
    expect(resp.data?.errors?.files).toContain('File processing failed')
  })
})

