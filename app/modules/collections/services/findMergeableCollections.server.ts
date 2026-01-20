import type { Collection } from '../collections.types';
import { CollectionService } from '../collection';

interface FindMergeableCollectionsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export default async function findMergeableCollections(
  targetCollectionId: string,
  options?: FindMergeableCollectionsOptions
): Promise<{ data: Collection[]; count: number; totalPages: number }> {
  const targetCollection = await CollectionService.findById(targetCollectionId);
  if (!targetCollection) {
    throw new Error('Collection not found');
  }

  const targetSessionIds = targetCollection.sessions;

  const match: Record<string, unknown> = {
    project: targetCollection.project,
    _id: { $ne: targetCollectionId },
    sessions: { $all: targetSessionIds, $size: targetSessionIds.length },
    annotationType: targetCollection.annotationType
  };

  if (options?.search) {
    match.name = { $regex: options.search, $options: 'i' };
  }

  return CollectionService.paginate({
    match,
    page: options?.page,
    pageSize: options?.pageSize
  });
}
