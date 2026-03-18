import { RunService } from "~/modules/runs/run";
import { RunSetService } from "~/modules/runSets/runSet";

export default async function stopAllRuns(runSetId: string): Promise<number> {
  const runSet = await RunSetService.findById(runSetId);
  if (!runSet) throw new Error("Run set not found");

  const runIds = runSet.runs ?? [];
  if (runIds.length === 0) return 0;

  const activeRuns = await RunService.find({
    match: {
      _id: { $in: runIds },
      isComplete: false,
      stoppedAt: null,
    },
  });

  await Promise.all(activeRuns.map((run) => RunService.stop(run._id)));

  return activeRuns.length;
}
