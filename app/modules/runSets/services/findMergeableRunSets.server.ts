import { RunSetService } from "../runSet";
import type { RunSet } from "../runSets.types";

interface FindMergeableRunSetsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export default async function findMergeableRunSets(
  targetRunSetId: string,
  options?: FindMergeableRunSetsOptions,
): Promise<{ data: RunSet[]; count: number; totalPages: number }> {
  const targetRunSet = await RunSetService.findById(targetRunSetId);
  if (!targetRunSet) {
    throw new Error("Run set not found");
  }

  const targetSessionIds = targetRunSet.sessions;

  const match: Record<string, unknown> = {
    project: targetRunSet.project,
    _id: { $ne: targetRunSetId },
    sessions: { $all: targetSessionIds, $size: targetSessionIds.length },
    annotationType: targetRunSet.annotationType,
  };

  if (options?.search) {
    match.name = { $regex: options.search, $options: "i" };
  }

  return RunSetService.paginate({
    match,
    page: options?.page,
    pageSize: options?.pageSize,
  });
}
