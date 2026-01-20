import { RunService } from '~/modules/runs/run';
import type { Collection } from '../collections.types';
import { CollectionService } from '../collection';
import { getCollectionAnnotationType } from '../helpers/getCollectionAnnotationType';
import { isRunCompatibleWithCollection } from '../helpers/isRunCompatibleWithCollection';

interface AddRunsResult {
  collection: Collection;
  added: string[];
  skipped: string[];
  errors: string[];
}

export default async function addRunsToCollection(
  collectionId: string,
  runIds: string[]
): Promise<AddRunsResult> {
  const collection = await CollectionService.findById(collectionId);
  if (!collection) {
    throw new Error('Collection not found');
  }

  let targetAnnotationType = await getCollectionAnnotationType(collection);
  const existingRunIds = new Set(collection.runs || []);

  const added: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const runId of runIds) {
    if (existingRunIds.has(runId)) {
      skipped.push(runId);
      continue;
    }

    const run = await RunService.findById(runId);
    if (!run) {
      errors.push(`Run ${runId}: not found`);
      continue;
    }

    const { compatible, reason } = isRunCompatibleWithCollection(run, collection, targetAnnotationType);
    if (!compatible) {
      errors.push(`Run ${runId}: ${reason}`);
      continue;
    }

    added.push(runId);
    if (!targetAnnotationType) {
      targetAnnotationType = run.annotationType;
    }
  }

  const updatedRuns = [...(collection.runs || []), ...added];
  const updatedCollection = await CollectionService.updateById(collectionId, { runs: updatedRuns });

  return {
    collection: updatedCollection!,
    added,
    skipped,
    errors
  };
}
