import { RunService } from '~/modules/runs/run';
import type { Collection } from '../collections.types';

export async function getCollectionAnnotationType(collection: Collection): Promise<string | null> {
  if (!collection.runs || collection.runs.length === 0) {
    return null;
  }

  const firstRun = await RunService.findById(collection.runs[0]);
  return firstRun?.annotationType || null;
}
