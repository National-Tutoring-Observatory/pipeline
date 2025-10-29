import type { Route } from "./+types/annotations.route";
import type { Run } from "~/modules/runs/runs.types";
import fse from 'fs-extra';
import type { Session } from "~/modules/sessions/sessions.types";
import find from 'lodash/find';
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import path from "path";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import validateProjectOwnership from "~/modules/projects/helpers/validateProjectOwnership";
import { redirect } from "react-router";

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { markedAs } = await request.json();

  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();

  const run = await documents.getDocument({ collection: 'runs', match: { _id: params.runId } }) as { data: Run };

  if (!run.data) {
    throw new Error("Run not found.");
  }

  const projectId = run.data.project as string;
  await validateProjectOwnership({ user, projectId });

  const session = await documents.getDocument({ collection: 'sessions', match: { _id: params.sessionId, project: projectId } }) as { data: Session };

  if (!session.data) {
    throw new Error("Session not found or does not belong to this project.");
  }

  const sessionPath = `storage/${run.data.project}/runs/${params.runId}/${params.sessionId}/${session.data.name}`;

  const storage = getStorageAdapter();

  await storage.download({ downloadPath: sessionPath });

  const sessionFile = await fse.readJSON(path.join('tmp', sessionPath));

  if (run.data.annotationType === 'PER_UTTERANCE') {
    const currentUtterance = find(sessionFile.transcript, { _id: params.annotationId });

    const currentAnnotation = find(currentUtterance.annotations, { _id: params.annotationId });

    if (currentAnnotation) {
      currentAnnotation.markedAs = markedAs;
    }
  } else {
    const currentAnnotation = find(sessionFile.annotations, { _id: params.annotationId });

    if (currentAnnotation) {
      currentAnnotation.markedAs = markedAs;
    }
  }

  await fse.outputJSON(`tmp/${sessionPath}`, sessionFile);

  const buffer = await fse.readFile(`tmp/${sessionPath}`);

  await storage.upload({ file: { buffer, size: buffer.length, type: 'application/json' }, uploadPath: `${sessionPath}` });

}
