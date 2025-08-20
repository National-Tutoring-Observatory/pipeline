import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/annotations.route";
import type { Run } from "~/modules/runs/runs.types";
import fse from 'fs-extra';
import type { Session } from "~/modules/sessions/sessions.types";
import find from 'lodash/find';
import getStorage from "~/core/storage/helpers/getStorage";
import path from "path";

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { markedAs } = await request.json();

  const run = await getDocument({ collection: 'runs', match: { _id: Number(params.runId) } }) as { data: Run };

  const session = await getDocument({ collection: 'sessions', match: { _id: Number(params.sessionId) } }) as { data: Session };

  const sessionPath = `storage/${run.data.project}/runs/${params.runId}/${params.sessionId}/${session.data.name}`;

  const storage = getStorage();

  if (!storage) {
    throw new Error('Storage is undefined. Failed to initialize storage.');
  }

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