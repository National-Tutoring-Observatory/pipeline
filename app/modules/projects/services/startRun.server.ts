import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import findModelByCode from "~/modules/llm/helpers/findModelByCode";
import type { Run, StartRunProps } from "~/modules/runs/runs.types";
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

  await documents.getDocument<Run>({
    collection: 'runs',
    match: { _id: runId, project: projectId }
  });

  const sessionsAsObjects = [];

  for (const session of sessions) {
    const sessionModel = await documents.getDocument<Session>({ collection: 'sessions', match: { _id: session } });
    if (!sessionModel.data) {
      throw new Error(`Session not found: ${session}`);
    }
    sessionsAsObjects.push({
      name: sessionModel.data.name,
      fileType: sessionModel.data.fileType,
      sessionId: session,
      status: 'NOT_STARTED'
    });
  }

  // Build snapshot of prompt and model configuration
  const snapshot = await buildRunSnapshot({
    promptId: prompt,
    promptVersionNumber: promptVersion,
    modelCode,
  });

  return await documents.updateDocument<Run>({
    collection: 'runs',
    match: { _id: runId },
    update: {
      hasSetup: true,
      annotationType,
      prompt,
      promptVersion,
      model: modelCode, // Store code for safety until migration runs
      sessions: sessionsAsObjects,
      snapshot
    }
  });
}
