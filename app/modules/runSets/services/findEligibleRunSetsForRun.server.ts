import { RunService } from "~/modules/runs/run";
import { RunSetService } from "../runSet";
import type { RunSet } from "../runSets.types";

interface FindEligibleRunSetsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export default async function findEligibleRunSetsForRun(
  runId: string,
  options?: FindEligibleRunSetsOptions,
): Promise<{ data: RunSet[]; count: number; totalPages: number }> {
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

  return RunSetService.paginate({
    match,
    page: options?.page,
    pageSize: options?.pageSize,
  });
}
