import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { emitter } from "~/modules/events/emitter";
import hasFeatureFlag from "~/modules/featureFlags/helpers/hasFeatureFlag";
import type { Project } from "~/modules/projects/projects.types";
import type { AnnotationSchemaItem, PromptVersion } from "~/modules/prompts/prompts.types";
import createTaskJob from "~/modules/queues/helpers/createTaskJob";
import type { Run } from "~/modules/runs/runs.types";
import type { Session } from "~/modules/sessions/sessions.types";
import { handler as annotatePerSession } from './annotatePerSession/app';
import { handler as annotatePerUtterance } from './annotatePerUtterance/app';

export default async function annotateRunSessions({ runId }: { runId: string }, context: { request: Request }) {

  const documents = getDocumentsAdapter();

  const run = await documents.getDocument({ collection: 'runs', match: { _id: runId } }) as { data: Run };
  const project = await documents.getDocument({ collection: 'projects', match: { _id: run.data.project } }) as { data: Project };

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

  const promptVersion = await documents.getDocument({ collection: 'promptVersions', match: { prompt: run.data.prompt, version: Number(run.data.promptVersion) } }) as { data: PromptVersion };

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
    const sessionModel = await documents.getDocument({ collection: 'sessions', match: { _id: session.sessionId } }) as { data: Session };

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

    let status;

    try {
      const hasWorkers = await hasFeatureFlag('HAS_WORKERS', context);
      if (run.data.annotationType === 'PER_UTTERANCE') {
        if (hasWorkers) {
          await createTaskJob({
            task: 'ANNOTATE_PER_UTTERANCE',
            job: {
              inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
              outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
              prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
              model: run.data.model,
              team: project.data.team
            }
          });
        } else {
          await annotatePerUtterance({
            body: {
              inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
              outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
              prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
              model: run.data.model,
              team: project.data.team
            }
          });
        }
      } else {
        if (hasWorkers) {
          await createTaskJob({
            task: 'ANNOTATE_PER_SESSION',
            job: {
              inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
              outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
              prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
              model: run.data.model,
              team: project.data.team
            }
          });
        } else {
          await annotatePerSession({
            body: {
              inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
              outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
              prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
              model: run.data.model,
              team: project.data.team
            }
          })
        }
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
