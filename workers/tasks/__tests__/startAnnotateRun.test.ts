import { beforeEach, describe, expect, it, vi } from 'vitest';
import 'app/modules/documents/documents';
import { Types } from 'mongoose';
import { RunService } from 'app/modules/runs/run';
import { ProjectService } from 'app/modules/projects/project';
import { TeamService } from 'app/modules/teams/team';
import clearDocumentDB from '../../../test/helpers/clearDocumentDB';
import startAnnotateRun from '../startAnnotateRun';
import type { Job } from 'bullmq';

vi.mock('../../helpers/emitFromJob');

describe('startAnnotateRun worker', () => {
  beforeEach(async () => {
    await clearDocumentDB();
    vi.clearAllMocks();
  });

  it('throws error if runId is missing', async () => {
    const job = {
      id: 'job-1',
      data: {}
    } as any as Job;

    await expect(startAnnotateRun(job)).rejects.toThrow('startAnnotateRun: runId is required');
  });

  it('throws error if run not found', async () => {
    const fakeRunId = new Types.ObjectId().toString();
    const job = {
      id: 'job-1',
      data: { runId: fakeRunId }
    } as any as Job;

    await expect(startAnnotateRun(job)).rejects.toThrow(`startAnnotateRun: Run not found: ${fakeRunId}`);
  });

  it('marks run as started', async () => {
    const team = await TeamService.create({ name: 'Test Team' });
    const project = await ProjectService.create({
      name: 'Test Project',
      team: team._id,
      createdBy: new Types.ObjectId().toString()
    });
    const run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      isRunning: false,
      isComplete: false,
      hasSetup: true
    });

    const job = {
      id: 'job-1',
      data: { runId: run._id }
    } as any as Job;

    const result = await startAnnotateRun(job);

    expect(result.status).toBe('SUCCESS');

    const updatedRun = await RunService.findById(run._id);
    expect(updatedRun?.isRunning).toBe(true);
    expect(updatedRun?.isComplete).toBe(false);
    expect(updatedRun?.hasErrored).toBe(false);
    expect(updatedRun?.startedAt).toBeDefined();
  });

  it('returns correct status on success', async () => {
    const team = await TeamService.create({ name: 'Test Team' });
    const project = await ProjectService.create({
      name: 'Test Project',
      team: team._id,
      createdBy: new Types.ObjectId().toString()
    });
    const run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      isRunning: false,
      isComplete: false,
      hasSetup: true
    });

    const job = {
      id: 'job-1',
      data: { runId: run._id }
    } as any as Job;

    const result = await startAnnotateRun(job);

    expect(result).toEqual({ status: 'SUCCESS' });
  });
});
