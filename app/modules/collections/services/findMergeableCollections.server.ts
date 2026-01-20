import { RunService } from '~/modules/runs/run';
import type { Collection } from '../collections.types';
import { CollectionService } from '../collection';
import { getCollectionAnnotationType } from '../helpers/getCollectionAnnotationType';
import { sessionsMatch } from '../helpers/sessionsMatch';

export default async function findMergeableCollections(
  targetCollectionId: string
): Promise<Collection[]> {
  const targetCollection = await CollectionService.findById(targetCollectionId);
  if (!targetCollection) {
    throw new Error('Collection not found');
  }

  const targetAnnotationType = await getCollectionAnnotationType(targetCollection);
  const targetSessionIds = targetCollection.sessions.map(String);

  const allCollections = await CollectionService.find({
    match: {
      project: targetCollection.project,
      _id: { $ne: targetCollectionId }
    }
  });

  const mergeableCollections: Collection[] = [];

  for (const collection of allCollections) {
    const collectionSessionIds = collection.sessions.map(String);
    if (!sessionsMatch(collectionSessionIds, targetSessionIds)) {
      continue;
    }

    if (targetAnnotationType && collection.runs && collection.runs.length > 0) {
      const firstRun = await RunService.findById(collection.runs[0]);
      if (firstRun && firstRun.annotationType !== targetAnnotationType) {
        continue;
      }
    }

    mergeableCollections.push(collection);
  }

  return mergeableCollections;
}
