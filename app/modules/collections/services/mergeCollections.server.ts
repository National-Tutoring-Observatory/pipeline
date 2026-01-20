import { RunService } from '~/modules/runs/run';
import type { Collection } from '../collections.types';
import { CollectionService } from '../collection';
import { getCollectionAnnotationType } from '../helpers/getCollectionAnnotationType';
import { sessionsMatch } from '../helpers/sessionsMatch';

interface MergeResult {
  collection: Collection;
  added: string[];
  skipped: string[];
}

async function validateSourceCollection(
  sourceCollection: Collection,
  targetCollection: Collection,
  targetSessionIds: string[],
  targetAnnotationType: string | null
): Promise<void> {
  const sourceSessionIds = sourceCollection.sessions.map(String);

  if (!sessionsMatch(targetSessionIds, sourceSessionIds)) {
    throw new Error('Collections are not compatible for merging');
  }

  if (targetCollection.project !== sourceCollection.project) {
    throw new Error('Collections are not compatible for merging');
  }

  if (targetAnnotationType && sourceCollection.runs && sourceCollection.runs.length > 0) {
    const firstSourceRun = await RunService.findById(sourceCollection.runs[0]);
    if (firstSourceRun && firstSourceRun.annotationType !== targetAnnotationType) {
      throw new Error('Collections are not compatible for merging');
    }
  }
}

export default async function mergeCollections(
  targetCollectionId: string,
  sourceCollectionIds: string | string[]
): Promise<MergeResult> {
  const sourceIds = Array.isArray(sourceCollectionIds) ? sourceCollectionIds : [sourceCollectionIds];

  const targetCollection = await CollectionService.findById(targetCollectionId);
  if (!targetCollection) {
    throw new Error('Target collection not found');
  }

  const targetSessionIds = targetCollection.sessions.map(String);
  let targetAnnotationType = await getCollectionAnnotationType(targetCollection);

  const existingRunIds = new Set(targetCollection.runs || []);
  const added: string[] = [];
  const skipped: string[] = [];

  for (const sourceCollectionId of sourceIds) {
    const sourceCollection = await CollectionService.findById(sourceCollectionId);
    if (!sourceCollection) {
      throw new Error('Source collection not found');
    }

    await validateSourceCollection(
      sourceCollection,
      targetCollection,
      targetSessionIds,
      targetAnnotationType
    );

    for (const runId of sourceCollection.runs || []) {
      if (existingRunIds.has(runId)) {
        skipped.push(runId);
      } else {
        added.push(runId);
        existingRunIds.add(runId);
        if (!targetAnnotationType) {
          const run = await RunService.findById(runId);
          if (run) {
            targetAnnotationType = run.annotationType;
          }
        }
      }
    }
  }

  const updatedRuns = [...(targetCollection.runs || []), ...added];
  const updatedCollection = await CollectionService.updateById(targetCollectionId, { runs: updatedRuns });

  return {
    collection: updatedCollection!,
    added,
    skipped
  };
}
