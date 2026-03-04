import { sessionsMatch } from "../helpers/sessionsMatch";
import { RunSetService } from "../runSet";
import type { RunSet } from "../runSets.types";

interface MergeResult {
  runSet: RunSet;
  added: string[];
  skipped: string[];
}

function validateSourceRunSet(
  sourceRunSet: RunSet,
  targetRunSet: RunSet,
): void {
  if (targetRunSet.project !== sourceRunSet.project) {
    throw new Error("Run sets are not compatible for merging");
  }

  if (!sessionsMatch(targetRunSet.sessions, sourceRunSet.sessions)) {
    throw new Error("Run sets are not compatible for merging");
  }

  if (sourceRunSet.annotationType !== targetRunSet.annotationType) {
    throw new Error("Run sets are not compatible for merging");
  }
}

export default async function mergeRunSets(
  targetRunSetId: string,
  sourceRunSetIds: string | string[],
): Promise<MergeResult> {
  const sourceIds = Array.isArray(sourceRunSetIds)
    ? sourceRunSetIds
    : [sourceRunSetIds];

  const targetRunSet = await RunSetService.findById(targetRunSetId);
  if (!targetRunSet) {
    throw new Error("Target run set not found");
  }

  const existingRunIds = new Set(targetRunSet.runs || []);
  const added: string[] = [];
  const skipped: string[] = [];

  for (const sourceRunSetId of sourceIds) {
    const sourceRunSet = await RunSetService.findById(sourceRunSetId);
    if (!sourceRunSet) {
      throw new Error("Source runSet not found");
    }

    validateSourceRunSet(sourceRunSet, targetRunSet);

    for (const runId of sourceRunSet.runs || []) {
      if (existingRunIds.has(runId)) {
        skipped.push(runId);
      } else {
        added.push(runId);
        existingRunIds.add(runId);
      }
    }
  }

  const updatedRuns = [...(targetRunSet.runs || []), ...added];
  const updatedRunSet = await RunSetService.updateById(targetRunSetId, {
    runs: updatedRuns,
  });

  return {
    runSet: updatedRunSet!,
    added,
    skipped,
  };
}
