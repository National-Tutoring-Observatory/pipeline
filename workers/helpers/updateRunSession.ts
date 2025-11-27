import extend from 'lodash/extend.js';
import find from 'lodash/find.js';
import getDocumentsAdapter from "../../app/modules/documents/helpers/getDocumentsAdapter";
import type { Run, RunSession } from "../../app/modules/runs/runs.types";

export default async function updateRunSession({ runId, sessionId, update }: { runId: string, sessionId: string, update: Partial<RunSession> }) {
  const documents = getDocumentsAdapter();
  const run = await documents.getDocument<Run>({ collection: 'runs', match: { _id: runId } });

  if (!run.data) {
    throw new Error(`Run not found: ${runId}`);
  }

  let session = find(run.data.sessions, { sessionId }) as RunSession;

  extend(session, update);

  await documents.updateDocument({
    collection: 'runs',
    match: { _id: runId },
    update: {
      sessions: run.data.sessions
    }
  });
}
