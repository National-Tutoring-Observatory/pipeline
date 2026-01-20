import { RunService } from '~/modules/runs/run';
import type { Run } from '~/modules/runs/runs.types';
import { CollectionService } from '../collection';

interface FindEligibleRunsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export default async function findEligibleRuns(
  collectionId: string,
  options?: FindEligibleRunsOptions
): Promise<{ data: Run[]; count: number; totalPages: number }> {
  const collection = await CollectionService.findById(collectionId);
  if (!collection) {
    throw new Error('Collection not found');
  }

  const collectionSessionIds = collection.sessions;

  const match: Record<string, unknown> = {
    project: collection.project,
    _id: { $nin: collection.runs || [] },
    'sessions.sessionId': { $all: collectionSessionIds },
    sessions: { $size: collectionSessionIds.length },
    annotationType: collection.annotationType
  };

  if (options?.search) {
    match.name = { $regex: options.search, $options: 'i' };
  }

  return RunService.paginate({
    match,
    page: options?.page,
    pageSize: options?.pageSize
  });
}
