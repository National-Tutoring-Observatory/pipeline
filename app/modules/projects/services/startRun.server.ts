import { RunService } from "~/modules/runs/run";
import type { RunSession, StartRunProps } from "~/modules/runs/runs.types";
import buildRunSnapshot from "~/modules/runs/services/buildRunSnapshot.server";
import { SessionService } from "~/modules/sessions/session";

export default async function startRun({
  runId,
  projectId,
  sessions,
  annotationType,
  prompt,
  promptVersion,
  modelCode,
}: StartRunProps) {
  const run = await RunService.findById(runId);
  if (!run || run.project !== projectId) {
    throw new Error("Run not found");
  }

  const sessionsAsObjects: RunSession[] = [];

  for (const session of sessions) {
    const sessionModel = await SessionService.findById(session);
    if (!sessionModel) {
      throw new Error(`Session not found: ${session}`);
    }
    sessionsAsObjects.push({
      name: sessionModel.name,
      fileType: sessionModel.fileType || "",
      sessionId: session,
      status: "RUNNING",
      startedAt: new Date(),
      finishedAt: new Date(),
    });
  }

  // Build snapshot of prompt and model configuration
  const snapshot = await buildRunSnapshot({
    promptId: prompt,
    promptVersionNumber: promptVersion,
    modelCode,
  });

  return await RunService.updateById(runId, {
    annotationType,
    prompt,
    promptVersion,
    model: modelCode,
    sessions: sessionsAsObjects,
    snapshot,
  });
}
