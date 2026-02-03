import { RunService } from "~/modules/runs/run";
import { CollectionService } from "../collection";
import type { Collection } from "../collections.types";

export default async function createCollectionForRun(
  runId: string,
  name: string,
): Promise<Collection> {
  const run = await RunService.findById(runId);
  if (!run) {
    throw new Error("Run not found");
  }

  const sessionIds = run.sessions.map((s) => s.sessionId);

  const collection = await CollectionService.create({
    name,
    project: typeof run.project === "string" ? run.project : run.project._id,
    sessions: sessionIds,
    annotationType: run.annotationType,
    runs: [runId],
    hasSetup: true,
  });

  return collection;
}
