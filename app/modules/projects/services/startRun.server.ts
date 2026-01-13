import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { RunService } from "~/modules/runs/run";
import type { StartRunProps, RunSession } from "~/modules/runs/runs.types";
import buildRunSnapshot from "~/modules/runs/services/buildRunSnapshot.server";
import type { Session } from "~/modules/sessions/sessions.types";


export default async function startRun({
  runId,
  projectId,
  sessions,
  annotationType,
  prompt,
  promptVersion,
  modelCode
}: StartRunProps, { context }: { request: Request, context: any }) {

  const documents = getDocumentsAdapter();

  const run = await RunService.findById(runId);
  if (!run || run.project !== projectId) {
    throw new Error('Run not found');
  }

  const sessionsAsObjects: RunSession[] = [];

  for (const session of sessions) {
    const sessionModel = await documents.getDocument<Session>({ collection: 'sessions', match: { _id: session } });
    if (!sessionModel.data) {
      throw new Error(`Session not found: ${session}`);
    }
    sessionsAsObjects.push({
      name: sessionModel.data.name,
      fileType: sessionModel.data.fileType,
      sessionId: session,
      status: 'RUNNING',
      startedAt: new Date(),
      finishedAt: new Date()
    });
  }

  // Build snapshot of prompt and model configuration
  const snapshot = await buildRunSnapshot({
    promptId: prompt,
    promptVersionNumber: promptVersion,
    modelCode,
  });

  return await RunService.updateById(runId, {
    hasSetup: true,
    annotationType,
    prompt,
    promptVersion,
    model: modelCode,
    sessions: sessionsAsObjects,
    snapshot
  });
}
