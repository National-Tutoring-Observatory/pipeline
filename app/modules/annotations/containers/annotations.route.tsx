import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/annotations.route";
import type { Run } from "~/modules/runs/runs.types";
import fse from 'fs-extra';
import type { Session } from "~/modules/sessions/sessions.types";
import find from 'lodash/find';

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { markedAs } = await request.json();

  const run = await getDocument({ collection: 'runs', match: { _id: Number(params.runId) } }) as { data: Run };

  const session = await getDocument({ collection: 'sessions', match: { _id: Number(params.sessionId) } }) as { data: Session };

  const sessionFile = await fse.readJSON(`./storage/${run.data.project}/runs/${params.runId}/${params.sessionId}/${session.data.name}`);

  const currentUtterance = find(sessionFile.transcript, { _id: params.annotationId });

  const currentAnnotation = find(currentUtterance.annotations, { _id: params.annotationId });

  if (currentAnnotation) {
    currentAnnotation.markedAs = markedAs;
  }

  await fse.outputJSON(`./storage/${run.data.project}/runs/${params.runId}/${params.sessionId}/${session.data.name}`, sessionFile);

}