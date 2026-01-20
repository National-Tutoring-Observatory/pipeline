import { getTotalPages } from '~/helpers/pagination';
import { RunService } from '~/modules/runs/run';
import type { Run } from '~/modules/runs/runs.types';
import { CollectionService } from '../collection';
import { getCollectionAnnotationType } from '../helpers/getCollectionAnnotationType';
import { isRunCompatibleWithCollection } from '../helpers/isRunCompatibleWithCollection';

interface FindEligibleRunsOptions {
  page?: number;
  pageSize?: number;
}

export default async function findEligibleRuns(
  collectionId: string,
  options?: FindEligibleRunsOptions
): Promise<{ data: Run[]; count: number; totalPages: number }> {
  const collection = await CollectionService.findById(collectionId);
  if (!collection) {
    throw new Error('Collection not found');
  }

  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;

  const targetAnnotationType = await getCollectionAnnotationType(collection);

  const allRuns = await RunService.find({
    match: { project: collection.project }
  });

  const existingRunIds = new Set(collection.runs || []);

  const eligibleRuns = allRuns.filter(run => {
    if (existingRunIds.has(run._id)) {
      return false;
    }

    const { compatible } = isRunCompatibleWithCollection(run, collection, targetAnnotationType);
    return compatible;
  });

  const count = eligibleRuns.length;
  const totalPages = getTotalPages(count, pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedRuns = eligibleRuns.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedRuns,
    count,
    totalPages
  };
}
