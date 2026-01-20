import { beforeEach, describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { UserService } from '~/modules/users/user';
import { TeamService } from '~/modules/teams/team';
import { ProjectService } from '~/modules/projects/project';
import { CollectionService } from '~/modules/collections/collection';
import { RunService } from '~/modules/runs/run';
import { SessionService } from '~/modules/sessions/session';
import type { User } from '~/modules/users/users.types';
import type { Team } from '~/modules/teams/teams.types';
import type { Project } from '~/modules/projects/projects.types';
import type { Collection } from '~/modules/collections/collections.types';
import type { Run } from '~/modules/runs/runs.types';
import type { Session } from '~/modules/sessions/sessions.types';
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader, action } from '../containers/collectionDetail.route';

describe('collectionDetail.route loader', () => {
  let user: User;
  let team: Team;
  let project: Project;
  let collection: Collection;
  let session: Session;
  let run: Run;
  let cookieHeader: string;

  beforeEach(async () => {
    await clearDocumentDB();

    // Setup test data
    user = await UserService.create({ username: 'test_user', teams: [] });
    team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: 'ADMIN' }]
    });
    project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });
    session = await SessionService.create({
      name: 'Test Session',
      project: project._id
    });
    run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      annotationType: 'PER_UTTERANCE',
      isRunning: false,
      isComplete: false
    });
    collection = await CollectionService.create({
      name: 'Test Collection',
      project: project._id,
      sessions: [session._id],
      runs: [run._id]
    });

    cookieHeader = await loginUser(user._id);
  });

  it('redirects to / when there is no session', async () => {
    const res = await loader({
      request: new Request('http://localhost/'),
      params: { projectId: project._id, collectionId: collection._id },
      unstable_pattern: '',
      context: {}
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get('Location')).toBe('/');
  });

  it('redirects to / when project not found', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await loader({
      request: new Request('http://localhost/', {
        headers: { cookie: cookieHeader }
      }),
      params: { projectId: fakeId, collectionId: collection._id },
      unstable_pattern: '',
      context: {}
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get('Location')).toBe('/');
  });

  it('redirects to / when user cannot view project', async () => {
    const otherUser = await UserService.create({
      username: 'other_user',
      teams: []
    });
    const otherCookie = await loginUser(otherUser._id);

    const res = await loader({
      request: new Request('http://localhost/', {
        headers: { cookie: otherCookie }
      }),
      params: { projectId: project._id, collectionId: collection._id },
      unstable_pattern: '',
      context: {}
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get('Location')).toBe('/');
  });

  it('redirects to collections list when collection not found', async () => {
    const fakeId = new Types.ObjectId().toString();
    const res = await loader({
      request: new Request('http://localhost/', {
        headers: { cookie: cookieHeader }
      }),
      params: { projectId: project._id, collectionId: fakeId },
      unstable_pattern: '',
      context: {}
    } as any);

    expect(res).toBeInstanceOf(Response);
    expect((res as Response).headers.get('Location')).toBe(
      `/projects/${project._id}/collections`
    );
  });

  it('returns collection with empty runs and sessions arrays', async () => {
    const emptyCollection = await CollectionService.create({
      name: 'Empty Collection',
      project: project._id,
      sessions: [],
      runs: []
    });

    const res = await loader({
      request: new Request('http://localhost/', {
        headers: { cookie: cookieHeader }
      }),
      params: { projectId: project._id, collectionId: emptyCollection._id },
      unstable_pattern: '',
      context: {}
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as any;
    expect(data.collection._id).toBe(emptyCollection._id);
    expect(data.collection.name).toBe('Empty Collection');
    expect(data.runs).toEqual([]);
    expect(data.sessions).toEqual([]);
  });

  it('returns collection with runs and sessions', async () => {
    const res = await loader({
      request: new Request('http://localhost/', {
        headers: { cookie: cookieHeader }
      }),
      params: { projectId: project._id, collectionId: collection._id },
      unstable_pattern: '',
      context: {}
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as { collection: Collection; project: Project; runs: Run[]; sessions: Session[] };
    expect(data.collection._id).toBe(collection._id);
    expect(data.collection.name).toBe('Test Collection');
    expect(data.runs).toHaveLength(1);
    expect(data.runs[0]._id).toBe(run._id);
    expect(data.sessions).toHaveLength(1);
    expect(data.sessions[0]._id).toBe(session._id);
    expect(data.project._id).toBe(project._id);
  });

  it('returns collection with multiple runs and sessions', async () => {
    const session2 = await SessionService.create({
      name: 'Test Session 2',
      project: project._id
    });
    const run2 = await RunService.create({
      name: 'Test Run 2',
      project: project._id,
      annotationType: 'PER_SESSION',
      isRunning: true,
      isComplete: false
    });

    const multiCollection = await CollectionService.create({
      name: 'Multi Collection',
      project: project._id,
      sessions: [session._id, session2._id],
      runs: [run._id, run2._id]
    });

    const res = await loader({
      request: new Request('http://localhost/', {
        headers: { cookie: cookieHeader }
      }),
      params: { projectId: project._id, collectionId: multiCollection._id },
      unstable_pattern: '',
      context: {}
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as { collection: Collection; project: Project; runs: Run[]; sessions: Session[] };
    expect(data.collection._id).toBe(multiCollection._id);
    expect(data.runs).toHaveLength(2);
    expect(data.sessions).toHaveLength(2);
  });

  it('returns collection data in correct format', async () => {
    const res = await loader({
      request: new Request('http://localhost/', {
        headers: { cookie: cookieHeader }
      }),
      params: { projectId: project._id, collectionId: collection._id },
      unstable_pattern: '',
      context: {}
    } as any);

    expect(res).not.toBeInstanceOf(Response);
    const data = res as { collection: Collection; project: Project; runs: Run[]; sessions: Session[] };

    // Verify structure
    expect(data).toHaveProperty('collection');
    expect(data).toHaveProperty('project');
    expect(data).toHaveProperty('runs');
    expect(data).toHaveProperty('sessions');

    // Verify collection structure
    expect(data.collection).toHaveProperty('_id');
    expect(data.collection).toHaveProperty('name');
    expect(data.collection).toHaveProperty('project');
    expect(data.collection).toHaveProperty('sessions');
    expect(data.collection).toHaveProperty('runs');
  });
});

describe('collectionDetail.route action - ADD_RUNS_TO_COLLECTION', () => {
  let user: User;
  let team: Team;
  let project: Project;
  let collection: Collection;
  let session: Session;
  let cookieHeader: string;

  beforeEach(async () => {
    await clearDocumentDB();

    user = await UserService.create({ username: 'test_user', teams: [] });
    team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: 'ADMIN' }]
    });
    project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });
    session = await SessionService.create({
      name: 'Test Session',
      project: project._id
    });
    collection = await CollectionService.create({
      name: 'Test Collection',
      project: project._id,
      sessions: [session._id],
      runs: []
    });

    cookieHeader = await loginUser(user._id);
  });

  it('returns 403 when user cannot manage project', async () => {
    const otherUser = await UserService.create({
      username: 'other_user',
      teams: []
    });
    const otherCookie = await loginUser(otherUser._id);

    const run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      annotationType: 'PER_UTTERANCE',
      sessions: [{ sessionId: session._id, status: 'DONE', name: 'Test Session', fileType: 'json', startedAt: new Date(), finishedAt: new Date() }]
    });

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { cookie: otherCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        intent: 'ADD_RUNS_TO_COLLECTION',
        payload: { runIds: [run._id] }
      })
    });

    const resp = await action({
      request: req,
      params: { projectId: project._id, collectionId: collection._id }
    } as any) as any;

    expect(resp.init?.status).toBe(403);
    expect(resp.data?.errors?.project).toBe('Access denied');
  });

  it('adds runs successfully', async () => {
    const run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      annotationType: 'PER_UTTERANCE',
      sessions: [{ sessionId: session._id, status: 'DONE', name: 'Test Session', fileType: 'json', startedAt: new Date(), finishedAt: new Date() }]
    });

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { cookie: cookieHeader, 'content-type': 'application/json' },
      body: JSON.stringify({
        intent: 'ADD_RUNS_TO_COLLECTION',
        payload: { runIds: [run._id] }
      })
    });

    const resp = await action({
      request: req,
      params: { projectId: project._id, collectionId: collection._id }
    } as any) as any;

    expect(resp.intent).toBe('ADD_RUNS_TO_COLLECTION');
    expect(resp.added).toHaveLength(1);
    expect(resp.added).toContain(run._id);

    const updatedCollection = await CollectionService.findById(collection._id);
    expect(updatedCollection!.runs).toHaveLength(1);
    expect(updatedCollection!.runs).toContain(run._id);
  });
});

describe('collectionDetail.route action - MERGE_COLLECTIONS', () => {
  let user: User;
  let team: Team;
  let project: Project;
  let targetCollection: Collection;
  let sourceCollection: Collection;
  let session: Session;
  let cookieHeader: string;

  beforeEach(async () => {
    await clearDocumentDB();

    user = await UserService.create({ username: 'test_user', teams: [] });
    team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: 'ADMIN' }]
    });
    project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });
    session = await SessionService.create({
      name: 'Test Session',
      project: project._id
    });
    targetCollection = await CollectionService.create({
      name: 'Target Collection',
      project: project._id,
      sessions: [session._id],
      runs: []
    });

    cookieHeader = await loginUser(user._id);
  });

  it('returns 403 when user cannot manage project', async () => {
    const otherUser = await UserService.create({
      username: 'other_user',
      teams: []
    });
    const otherCookie = await loginUser(otherUser._id);

    const sourceRun = await RunService.create({
      name: 'Source Run',
      project: project._id,
      annotationType: 'PER_UTTERANCE',
      sessions: [{ sessionId: session._id, status: 'DONE', name: 'Test Session', fileType: 'json', startedAt: new Date(), finishedAt: new Date() }]
    });

    sourceCollection = await CollectionService.create({
      name: 'Source Collection',
      project: project._id,
      sessions: [session._id],
      runs: [sourceRun._id]
    });

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { cookie: otherCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        intent: 'MERGE_COLLECTIONS',
        payload: { sourceCollectionIds: [sourceCollection._id] }
      })
    });

    const resp = await action({
      request: req,
      params: { projectId: project._id, collectionId: targetCollection._id }
    } as any) as any;

    expect(resp.init?.status).toBe(403);
    expect(resp.data?.errors?.project).toBe('Access denied');
  });

  it('merges collections successfully', async () => {
    const sourceRun = await RunService.create({
      name: 'Source Run',
      project: project._id,
      annotationType: 'PER_UTTERANCE',
      sessions: [{ sessionId: session._id, status: 'DONE', name: 'Test Session', fileType: 'json', startedAt: new Date(), finishedAt: new Date() }]
    });

    sourceCollection = await CollectionService.create({
      name: 'Source Collection',
      project: project._id,
      sessions: [session._id],
      runs: [sourceRun._id]
    });

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { cookie: cookieHeader, 'content-type': 'application/json' },
      body: JSON.stringify({
        intent: 'MERGE_COLLECTIONS',
        payload: { sourceCollectionIds: [sourceCollection._id] }
      })
    });

    const resp = await action({
      request: req,
      params: { projectId: project._id, collectionId: targetCollection._id }
    } as any) as any;

    expect(resp.intent).toBe('MERGE_COLLECTIONS');
    expect(resp.added).toHaveLength(1);
    expect(resp.added).toContain(sourceRun._id);

    const updatedTarget = await CollectionService.findById(targetCollection._id);
    expect(updatedTarget!.runs).toHaveLength(1);
    expect(updatedTarget!.runs).toContain(sourceRun._id);

    const updatedSource = await CollectionService.findById(sourceCollection._id);
    expect(updatedSource!.runs).toHaveLength(1);
  });

  it('returns error when collections are incompatible', async () => {
    const session2 = await SessionService.create({
      name: 'Different Session',
      project: project._id
    });

    const incompatibleRun = await RunService.create({
      name: 'Incompatible Run',
      project: project._id,
      annotationType: 'PER_UTTERANCE',
      sessions: [{ sessionId: session2._id, status: 'DONE', name: 'Different Session', fileType: 'json', startedAt: new Date(), finishedAt: new Date() }]
    });

    const incompatibleCollection = await CollectionService.create({
      name: 'Incompatible Collection',
      project: project._id,
      sessions: [session2._id],
      runs: [incompatibleRun._id]
    });

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { cookie: cookieHeader, 'content-type': 'application/json' },
      body: JSON.stringify({
        intent: 'MERGE_COLLECTIONS',
        payload: { sourceCollectionIds: [incompatibleCollection._id] }
      })
    });

    await expect(
      action({
        request: req,
        params: { projectId: project._id, collectionId: targetCollection._id }
      } as any)
    ).rejects.toThrow('Collections are not compatible for merging');
  });
});
