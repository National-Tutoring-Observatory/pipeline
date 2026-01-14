import { beforeEach, describe, expect, it } from 'vitest';
import { UserService } from '~/modules/users/user';
import { TeamService } from '~/modules/teams/team';
import { ProjectService } from '~/modules/projects/project';
import { CollectionService } from '~/modules/collections/collection';
import { SessionService } from '~/modules/sessions/session';
import { PromptService } from '~/modules/prompts/prompt';
import { PromptVersionService } from '~/modules/prompts/promptVersion';
import { RunService } from '~/modules/runs/run';
import type { Collection } from '~/modules/collections/collections.types';
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB';
import createCollectionWithRuns from '../services/createCollectionWithRuns.server';

describe('createCollectionWithRuns', () => {
  let projectId: string;
  let sessions: string[];
  let prompt1: any;
  let prompt2: any;
  let models: string[];
  let collection: Collection;

  beforeEach(async () => {
    await clearDocumentDB();

    const user = await UserService.create({ username: 'test_user', teams: [] });
    const team = await TeamService.create({ name: 'Test Team' });
    await UserService.updateById(user._id, {
      teams: [{ team: team._id, role: 'ADMIN' }]
    });
    const project = await ProjectService.create({
      name: 'Test Project',
      createdBy: user._id,
      team: team._id
    });
    projectId = project._id;

    const session1 = await SessionService.create({
      name: 'Session 1',
      project: projectId
    });
    const session2 = await SessionService.create({
      name: 'Session 2',
      project: projectId
    });
    sessions = [session1._id, session2._id];

    prompt1 = await PromptService.create({
      name: 'Prompt 1',
      annotationType: 'PER_UTTERANCE'
    });
    await PromptVersionService.create({
      prompt: prompt1._id,
      version: 1,
      userPrompt: 'Test prompt 1',
      annotationSchema: []
    });

    prompt2 = await PromptService.create({
      name: 'Prompt 2',
      annotationType: 'PER_SESSION'
    });
    await PromptVersionService.create({
      prompt: prompt2._id,
      version: 1,
      userPrompt: 'Test prompt 2',
      annotationSchema: []
    });

    models = ['gpt-4', 'gpt-3.5'];

    collection = await CollectionService.create({
      name: 'Test Collection',
      project: projectId,
      sessions,
      runs: []
    });
  });

  it('returns collection with updated run list', async () => {
    const result = await createCollectionWithRuns(collection, {
      projectId,
      name: collection.name,
      sessions,
      prompts: [
        { promptId: prompt1._id, promptName: 'Prompt 1', version: 1 }
      ],
      models: ['gpt-4'],
      annotationType: 'PER_UTTERANCE'
    });

    expect(result).toHaveProperty('collection');
    expect(result).toHaveProperty('errors');
    expect(result.collection._id).toBe(collection._id);
    expect(result.collection.name).toBe(collection.name);
    expect(Array.isArray(result.collection.runs)).toBe(true);
  });


});
