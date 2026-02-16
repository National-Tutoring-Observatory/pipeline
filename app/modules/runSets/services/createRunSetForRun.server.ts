import { RunService } from "~/modules/runs/run";
import { RunSetService } from "../runSet";
import type { RunSet } from "../runSets.types";

export default async function createRunSetForRun(
  runId: string,
  name: string,
): Promise<RunSet> {
  const run = await RunService.findById(runId);
  if (!run) {
    throw new Error("Run not found");
  }

  const sessionIds = run.sessions.map((s) => s.sessionId);

  const runSet = await RunSetService.create({
    name,
    project: typeof run.project === "string" ? run.project : run.project._id,
    sessions: sessionIds,
    annotationType: run.annotationType,
    runs: [runId],
    hasSetup: true,
  });

  return runSet;
}
