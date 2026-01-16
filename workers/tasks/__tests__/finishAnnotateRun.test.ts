import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import { RunService } from 'app/modules/runs/run';
import { ProjectService } from 'app/modules/projects/project';
import { TeamService } from 'app/modules/teams/team';
import clearDocumentDB from '../../../test/helpers/clearDocumentDB';
import finishAnnotateRun from '../finishAnnotateRun';
import type { Job } from 'bullmq';

vi.mock('../../helpers/emitFromJob');

describe('finishAnnotateRun worker', () => {
  beforeEach(async () => {
    await clearDocumentDB();
    vi.clearAllMocks();
  });

  it('throws error if runId is missing', async () => {
    const job = {
      id: 'job-1',
      data: {},
      getChildrenValues: vi.fn().mockResolvedValue([])
    } as any as Job;

    await expect(finishAnnotateRun(job)).rejects.toThrow('finishAnnotateRun: runId is required');
  });

  it('throws error if run not found', async () => {
    const fakeRunId = new Types.ObjectId().toString();
    const job = {
      id: 'job-1',
      data: { runId: fakeRunId },
      getChildrenValues: vi.fn().mockResolvedValue([])
    } as any as Job;

    await expect(finishAnnotateRun(job)).rejects.toThrow(`finishAnnotateRun: Run not found: ${fakeRunId}`);
  });

  it('marks run as complete when all sessions succeed', async () => {
    const team = await TeamService.create({ name: 'Test Team' });
    const project = await ProjectService.create({
      name: 'Test Project',
      team: team._id,
      createdBy: new Types.ObjectId().toString()
    });
    const run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      isRunning: true,
      isComplete: false,
    });

    const job = {
      id: 'job-1',
      data: { runId: run._id },
      getChildrenValues: vi.fn().mockResolvedValue([
        { status: 'SUCCESS' },
        { status: 'SUCCESS' }
      ])
    } as any as Job;

    const result = await finishAnnotateRun(job);

    expect(result.status).toBe('SUCCESS');

    const updatedRun = await RunService.findById(run._id);
    expect(updatedRun?.isRunning).toBe(false);
    expect(updatedRun?.isComplete).toBe(true);
    expect(updatedRun?.hasErrored).toBe(false);
    expect(updatedRun?.finishedAt).toBeDefined();
  });

  it('marks run as errored when any session fails', async () => {
    const team = await TeamService.create({ name: 'Test Team' });
    const project = await ProjectService.create({
      name: 'Test Project',
      team: team._id,
      createdBy: new Types.ObjectId().toString()
    });
    const run = await RunService.create({
      name: 'Test Run',
      project: project._id,
      isRunning: true,
      isComplete: false,
    });

    const job = {
      id: 'job-1',
      data: { runId: run._id },
      getChildrenValues: vi.fn().mockResolvedValue([
        { status: 'SUCCESS' },
        { status: 'ERRORED' }
      ])
    } as any as Job;

    const result = await finishAnnotateRun(job);

    expect(result.status).toBe('SUCCESS');

    const updatedRun = await RunService.findById(run._id);
    expect(updatedRun?.isRunning).toBe(false);
    expect(updatedRun?.isComplete).toBe(true);
    expect(updatedRun?.hasErrored).toBe(true);
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
      isRunning: true,
      isComplete: false,
    });

    const job = {
      id: 'job-1',
      data: { runId: run._id },
      getChildrenValues: vi.fn().mockResolvedValue([])
    } as any as Job;

    const result = await finishAnnotateRun(job);

    expect(result).toEqual({ status: 'SUCCESS' });
  });
});
