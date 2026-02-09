import { RunService } from "~/modules/runs/run";
import type { Run } from "~/modules/runs/runs.types";
import { RunSetService } from "../runSet";

interface FindEligibleRunsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

export default async function findEligibleRuns(
  runSetId: string,
  options?: FindEligibleRunsOptions,
): Promise<{ data: Run[]; count: number; totalPages: number }> {
  const runSet = await RunSetService.findById(runSetId);
  if (!runSet) {
    throw new Error("Run set not found");
  }

  const runSetSessionIds = runSet.sessions;

  const match: Record<string, unknown> = {
    project: runSet.project,
    _id: { $nin: runSet.runs || [] },
    "sessions.sessionId": { $all: runSetSessionIds },
    sessions: { $size: runSetSessionIds.length },
    annotationType: runSet.annotationType,
  };

  if (options?.search) {
    match.name = { $regex: options.search, $options: "i" };
  }

  return RunService.paginate({
    match,
    page: options?.page,
    pageSize: options?.pageSize,
  });
}
