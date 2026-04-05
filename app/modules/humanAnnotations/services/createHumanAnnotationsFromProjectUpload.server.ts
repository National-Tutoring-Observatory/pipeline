import { SessionService } from "~/modules/sessions/session";
import type { AnnotatorMeta } from "~/modules/uploads/services/detectAnnotatorsFromFiles.server";
import buildAnnotationSchemaFromHeaders from "../helpers/buildAnnotationSchemaFromHeaders";
import createHumanRun from "./createHumanRun.server";
import uploadHumanAnnotations from "./uploadHumanAnnotations.server";

export default async function createHumanAnnotationsFromProjectUpload({
  projectId,
  annotatorMeta,
}: {
  projectId: string;
  annotatorMeta: AnnotatorMeta;
}) {
  const { headers, annotators, csvPath } = annotatorMeta;

  const sessions = await SessionService.find({
    match: { project: projectId },
  });

  if (sessions.length === 0) {
    console.log(
      `[createHumanAnnotationsFromProjectUpload] No sessions found for project ${projectId}, skipping human annotation creation`,
    );
    return;
  }

  console.log(
    `[createHumanAnnotationsFromProjectUpload] Creating human runs for ${annotators.length} annotator(s) across ${sessions.length} session(s)`,
  );

  const sessionIds = sessions.map((s) => s._id);
  const annotationSchema = buildAnnotationSchemaFromHeaders(headers);

  const matchedSessions = sessions.map((s) => ({
    sessionId: s.name.replace(/\.[^.]+$/, ""),
    name: s.name,
    _id: s._id,
  }));

  const runIds: string[] = [];
  for (const annotator of annotators) {
    const run = await createHumanRun({
      project: projectId,
      name: annotator,
      annotationType: "PER_UTTERANCE",
      sessionIds,
      annotationSchema,
    });
    runIds.push(run._id);
  }

  await uploadHumanAnnotations({
    runIds,
    annotators,
    headers,
    csvPath,
    projectId,
    matchedSessions,
  });
}
