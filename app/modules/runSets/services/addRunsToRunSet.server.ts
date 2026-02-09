import { RunService } from "~/modules/runs/run";
import { isRunCompatibleWithRunSet } from "../helpers/isRunCompatibleWithRunSet";
import { RunSetService } from "../runSet";
import type { RunSet } from "../runSets.types";

interface AddRunsResult {
  runSet: RunSet;
  added: string[];
  skipped: string[];
  errors: string[];
}

export default async function addRunsToRunSet(
  runSetId: string,
  runIds: string[],
): Promise<AddRunsResult> {
  const runSet = await RunSetService.findById(runSetId);
  if (!runSet) {
    throw new Error("Run set not found");
  }

  const existingRunIds = new Set(runSet.runs || []);

  const added: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const runId of runIds) {
    if (existingRunIds.has(runId)) {
      skipped.push(runId);
      continue;
    }

    const run = await RunService.findById(runId);
    if (!run) {
      errors.push(`Run ${runId}: not found`);
      continue;
    }

    const { compatible, reason } = isRunCompatibleWithRunSet(run, runSet);
    if (!compatible) {
      errors.push(`Run ${runId}: ${reason}`);
      continue;
    }

    added.push(runId);
  }

  const updatedRuns = [...(runSet.runs || []), ...added];
  const updatedRunSet = await RunSetService.updateById(runSetId, {
    runs: updatedRuns,
    hasExportedCSV: false,
    hasExportedJSONL: false,
  });

  return {
    runSet: updatedRunSet!,
    added,
    skipped,
    errors,
  };
}
