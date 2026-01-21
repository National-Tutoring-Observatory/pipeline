import { CollectionService } from "../collection";
import type { Collection } from "../collections.types";
import { sessionsMatch } from "../helpers/sessionsMatch";

interface MergeResult {
  collection: Collection;
  added: string[];
  skipped: string[];
}

function validateSourceCollection(
  sourceCollection: Collection,
  targetCollection: Collection,
): void {
  if (targetCollection.project !== sourceCollection.project) {
    throw new Error("Collections are not compatible for merging");
  }

  if (!sessionsMatch(targetCollection.sessions, sourceCollection.sessions)) {
    throw new Error("Collections are not compatible for merging");
  }

  if (sourceCollection.annotationType !== targetCollection.annotationType) {
    throw new Error("Collections are not compatible for merging");
  }
}

export default async function mergeCollections(
  targetCollectionId: string,
  sourceCollectionIds: string | string[],
): Promise<MergeResult> {
  const sourceIds = Array.isArray(sourceCollectionIds)
    ? sourceCollectionIds
    : [sourceCollectionIds];

  const targetCollection = await CollectionService.findById(targetCollectionId);
  if (!targetCollection) {
    throw new Error("Target collection not found");
  }

  const existingRunIds = new Set(targetCollection.runs || []);
  const added: string[] = [];
  const skipped: string[] = [];

  for (const sourceCollectionId of sourceIds) {
    const sourceCollection =
      await CollectionService.findById(sourceCollectionId);
    if (!sourceCollection) {
      throw new Error("Source collection not found");
    }

    validateSourceCollection(sourceCollection, targetCollection);

    for (const runId of sourceCollection.runs || []) {
      if (existingRunIds.has(runId)) {
        skipped.push(runId);
      } else {
        added.push(runId);
        existingRunIds.add(runId);
      }
    }
  }

  const updatedRuns = [...(targetCollection.runs || []), ...added];
  const updatedCollection = await CollectionService.updateById(
    targetCollectionId,
    {
      runs: updatedRuns,
      hasExportedCSV: false,
      hasExportedJSONL: false,
    },
  );

  return {
    collection: updatedCollection!,
    added,
    skipped,
  };
}
