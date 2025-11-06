import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Run, StartRunProps } from "~/modules/runs/runs.types";
import type { Session } from "~/modules/sessions/sessions.types";


export default async function startRun({
  runId,
  projectId,
  sessions,
  annotationType,
  prompt,
  promptVersion,
  model
}: StartRunProps, { context }: { context: any }) {

  console.log(context);

  const documents = getDocumentsAdapter();

  await documents.getDocument({
    collection: 'runs',
    match: { _id: runId, project: projectId }
  }) as { data: Run };

  const sessionsAsObjects = [];

  for (const session of sessions) {
    const sessionModel = await documents.getDocument({ collection: 'sessions', match: { _id: session } }) as { data: Session };
    sessionsAsObjects.push({
      name: sessionModel.data.name,
      fileType: sessionModel.data.fileType,
      sessionId: session,
      status: 'NOT_STARTED'
    });
  }

  return await documents.updateDocument({
    collection: 'runs',
    match: { _id: runId },
    update: {
      hasSetup: true,
      annotationType,
      prompt,
      promptVersion,
      model,
      sessions: sessionsAsObjects
    }
  }) as { data: Run };
}
