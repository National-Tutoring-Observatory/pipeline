import extend from "lodash/extend.js";
import find from "lodash/find.js";
import { RunService } from "../../app/modules/runs/run";
import type { RunSession } from "../../app/modules/runs/runs.types";

export default async function updateRunSession({
  runId,
  sessionId,
  update,
}: {
  runId: string;
  sessionId: string;
  update: Partial<RunSession>;
}) {
  const run = await RunService.findById(runId);

  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  let session = find(run.sessions, { sessionId }) as RunSession;

  extend(session, update);

  await RunService.updateById(runId, {
    sessions: run.sessions,
  });
}
