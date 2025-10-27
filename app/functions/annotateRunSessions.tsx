import type { Run } from "~/modules/runs/runs.types";
import { emitter } from "~/modules/events/emitter";
import { handler as annotatePerUtterance } from './annotatePerUtterance/app';
import { handler as annotatePerSession } from './annotatePerSession/app';
import type { Session } from "~/modules/sessions/sessions.types";
import type { AnnotationSchemaItem, PromptVersion } from "~/modules/prompts/prompts.types";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Project } from "~/modules/projects/projects.types";
import getQueue from "~/modules/queues/helpers/getQueue";
import hasFeatureFlag from "~/modules/featureFlags/helpers/hasFeatureFlag";

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
          const queue = getQueue('tasks');
          const job = await queue.add('ANNOTATE_PER_SESSION', {
            inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
            outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
            prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
            model: run.data.model,
            team: project.data.team
          }, {
            removeOnComplete: {
              age: 72 * 3600, // keep up to 1 hour
              count: 2000, // keep up to 2000 jobs
            },
            removeOnFail: {
              age: 72 * 3600,
              count: 2000,
            },
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

          const queue = getQueue('tasks');
          const job = await queue.add('ANNOTATE_PER_SESSION', {
            inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
            outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
            prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
            model: run.data.model,
            team: project.data.team
          }, {
            removeOnComplete: {
              age: 72 * 3600, // keep up to 1 hour
              count: 2000, // keep up to 2000 jobs
            },
            removeOnFail: {
              age: 72 * 3600,
              count: 2000,
            },
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