import { RunService } from "~/modules/runs/run";
import { CollectionService } from "../collection";
import type { Collection } from "../collections.types";

interface FindEligibleCollectionsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export default async function findEligibleCollectionsForRun(
  runId: string,
  options?: FindEligibleCollectionsOptions,
): Promise<{ data: Collection[]; count: number; totalPages: number }> {
  const run = await RunService.findById(runId);
  if (!run) {
    throw new Error("Run not found");
  }

  const runSessionIds = run.sessions.map((s) => s.sessionId);

  const match: Record<string, unknown> = {
    project: run.project,
    runs: { $nin: [runId] },
    sessions: { $all: runSessionIds, $size: runSessionIds.length },
    annotationType: run.annotationType,
  };

  if (options?.search) {
    match.name = { $regex: options.search, $options: "i" };
  }

  return CollectionService.paginate({
    match,
    page: options?.page,
    pageSize: options?.pageSize,
  });
}
