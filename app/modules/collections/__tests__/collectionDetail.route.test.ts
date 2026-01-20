import { beforeEach, describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { UserService } from '~/modules/users/user';
import { TeamService } from '~/modules/teams/team';
import { ProjectService } from '~/modules/projects/project';
import { CollectionService } from '~/modules/collections/collection';
import { RunService } from '~/modules/runs/run';
import { SessionService } from '~/modules/sessions/session';
import { FeatureFlagService } from '~/modules/featureFlags/featureFlag';
import type { User } from '~/modules/users/users.types';
import type { Team } from '~/modules/teams/teams.types';
import type { Project } from '~/modules/projects/projects.types';
import type { Collection } from '~/modules/collections/collections.types';
import type { Run } from '~/modules/runs/runs.types';
import type { Session } from '~/modules/sessions/sessions.types';
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import loginUser from '../../../../test/helpers/loginUser';
import { loader } from '../containers/collectionDetail.route';

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

    await FeatureFlagService.create({ name: 'HAS_PROJECT_COLLECTIONS' });
    user = await UserService.create({ username: 'test_user', teams: [], featureFlags: ['HAS_PROJECT_COLLECTIONS'] });
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
      runs: [run._id],
      annotationType: 'PER_UTTERANCE'
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
      runs: [],
      annotationType: 'PER_UTTERANCE'
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
      annotationType: 'PER_UTTERANCE',
      isRunning: true,
      isComplete: false
    });

    const multiCollection = await CollectionService.create({
      name: 'Multi Collection',
      project: project._id,
      sessions: [session._id, session2._id],
      runs: [run._id, run2._id],
      annotationType: 'PER_UTTERANCE'
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

    expect(data).toHaveProperty('collection');
    expect(data).toHaveProperty('project');
    expect(data).toHaveProperty('runs');
    expect(data).toHaveProperty('sessions');

    expect(data.collection).toHaveProperty('_id');
    expect(data.collection).toHaveProperty('name');
    expect(data.collection).toHaveProperty('project');
    expect(data.collection).toHaveProperty('sessions');
    expect(data.collection).toHaveProperty('runs');
  });
});
