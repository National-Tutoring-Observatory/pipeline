import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { emitter } from "~/modules/events/emitter";
import type { Project } from "~/modules/projects/projects.types";
import type { AnnotationSchemaItem, PromptVersion } from "~/modules/prompts/prompts.types";
import { getRunModelCode } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import type { Session } from "~/modules/sessions/sessions.types";
import { handler as annotatePerSession } from './annotatePerSession/app';
import { handler as annotatePerUtterance } from './annotatePerUtterance/app';

export default async function annotateRunSessions({ runId }: { runId: string }, context: { request: Request }) {

  const documents = getDocumentsAdapter();

  const run = await documents.getDocument<Run>({ collection: 'runs', match: { _id: runId } });
  if (!run.data) throw new Error(`Run not found: ${runId}`);
  const project = await documents.getDocument<Project>({ collection: 'projects', match: { _id: run.data.project } });
  if (!project.data) throw new Error(`Project not found: ${run.data.project}`);

  if (run.data.isRunning) { return {} }

  const inputDirectory = `storage/${run.data.project}/preAnalysis`;

  const outputDirectory = `storage/${run.data.project}/runs/${run.data._id}`;

  await documents.updateDocument({
    collection: 'runs',
    match: { _id: runId },
    update: {
      isRunning: true,
      startedAt: new Date()
    }
  });

  const promptVersion = await documents.getDocument<PromptVersion>({ collection: 'promptVersions', match: { prompt: run.data.prompt, version: Number(run.data.promptVersion) } });
  if (!promptVersion.data) throw new Error(`Prompt version not found: ${run.data.prompt} v${run.data.promptVersion}`);

  emitter.emit("ANNOTATE_RUN_SESSION", { runId: runId, progress: 0, status: 'STARTED', step: `0/${run.data.sessions.length}` });

  let annotationFields: Record<string, any> = {};

  for (const annotationSchemaItem of promptVersion.data.annotationSchema as AnnotationSchemaItem[]) {
    annotationFields[annotationSchemaItem.fieldKey] = annotationSchemaItem.value;
  }
  const annotationSchema = { "annotations": [annotationFields] };

  let completedSessions = 0;

  let hasErrored = false;

  for (const session of run.data.sessions) {
    if (session.status === 'DONE') {
      completedSessions++;
      emitter.emit("ANNOTATE_RUN_SESSION", { runId: runId, progress: Math.round((100 / run.data.sessions.length) * completedSessions), status: 'RUNNING' });
      continue;
    }
    const sessionModel = await documents.getDocument<Session>({ collection: 'sessions', match: { _id: session.sessionId } });
    if (!sessionModel.data) throw new Error(`Session not found: ${session.sessionId}`);

    session.status = 'RUNNING';
    session.startedAt = new Date();

    await documents.updateDocument({
      collection: 'runs',
      match: { _id: runId },
      update: {
        sessions: run.data.sessions
      }
    });

    emitter.emit("ANNOTATE_RUN_SESSION", { runId: runId, progress: Math.round((100 / run.data.sessions.length) * completedSessions), status: 'RUNNING', step: `${completedSessions + 1}/${run.data.sessions.length}` });

    let status: 'DONE' | 'ERRORED' | 'RUNNING';

    try {
      if (run.data.annotationType === 'PER_UTTERANCE') {
        await annotatePerUtterance({
          body: {
            inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
            outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
            prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
            model: getRunModelCode(run.data),
            team: project.data.team
          }
        });
      } else {
        await annotatePerSession({
          body: {
            inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
            outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
            prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
            model: getRunModelCode(run.data),
            team: project.data.team
          }
        })
      }
      status = 'DONE';
    } catch (error) {
      console.warn(error);
      status = 'ERRORED';
      hasErrored = true;
    }

    session.status = status;
    session.finishedAt = new Date();
    await documents.updateDocument({
      collection: 'runs',
      match: { _id: runId },
      update: {
        sessions: run.data.sessions,
      }
    });
    completedSessions++;
    emitter.emit("ANNOTATE_RUN_SESSION", { runId: runId, progress: Math.round((100 / run.data.sessions.length) * completedSessions), status: 'RUNNING' });
  }

  await documents.updateDocument({
    collection: 'runs',
    match: { _id: runId },
    update: {
      isRunning: false,
      isComplete: true,
      hasErrored,
      finishedAt: new Date()
    }
  });

  emitter.emit("ANNOTATE_RUN_SESSION", { runId: runId, progress: 100, status: 'DONE' });

}
