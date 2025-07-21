import type { Run } from "~/modules/runs/runs.types";
import getDocument from "../documents/getDocument";
import updateDocument from "../documents/updateDocument";
import { emitter } from "../events/emitter";
import { handler as annotatePerUtterance } from '../../functions/annotatePerUtterance/app';
import { handler as annotatePerSession } from '../../functions/annotatePerSession/app';
import type { Session } from "~/modules/sessions/sessions.types";
import type { AnnotationSchemaItem, PromptVersion } from "~/modules/prompts/prompts.types";

export default async function annotateRunSessions({ runId }: { runId: string }) {

  const run = await getDocument({ collection: 'runs', match: { _id: Number(runId) } }) as { data: Run };

  if (run.data.isRunning) { return {} }

  const inputDirectory = `./storage/${run.data.project}/preAnalysis`;

  const outputDirectory = `./storage/${run.data.project}/runs/${run.data._id}`;

  await updateDocument({
    collection: 'runs',
    match: { _id: Number(runId) },
    update: {
      isRunning: true,
      startedAt: new Date()
    }
  });

  const promptVersion = await getDocument({ collection: 'promptVersions', match: { prompt: Number(run.data.prompt), version: Number(run.data.promptVersion) } }) as { data: PromptVersion };

  emitter.emit("ANNOTATE_RUN_SESSION", { runId: Number(runId), progress: 0, status: 'STARTED', step: `0/${run.data.sessions.length}` });

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
      emitter.emit("ANNOTATE_RUN_SESSION", { runId: Number(runId), progress: Math.round((100 / run.data.sessions.length) * completedSessions), status: 'RUNNING' });
      continue;
    }
    const sessionModel = await getDocument({ collection: 'sessions', match: { _id: session.sessionId } }) as { data: Session };

    session.status = 'RUNNING';
    session.startedAt = new Date();

    await updateDocument({
      collection: 'runs',
      match: { _id: Number(runId) },
      update: {
        sessions: run.data.sessions
      }
    });

    emitter.emit("ANNOTATE_RUN_SESSION", { runId: Number(runId), progress: Math.round((100 / run.data.sessions.length) * completedSessions), status: 'RUNNING', step: `${completedSessions + 1}/${run.data.sessions.length}` });

    let status;

    try {
      if (run.data.annotationType === 'PER_UTTERANCE') {
        await annotatePerUtterance({
          body: {
            inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
            outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
            prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
            model: run.data.model,
            llmSettings: run.data.llmSettings
          }
        });
      } else {
        await annotatePerSession({
          body: {
            inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
            outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
            prompt: { prompt: promptVersion.data.userPrompt, annotationSchema },
            model: run.data.model,
            llmSettings: run.data.llmSettings
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
    await updateDocument({
      collection: 'runs',
      match: { _id: Number(runId) },
      update: {
        sessions: run.data.sessions,
      }
    });
    completedSessions++;
    emitter.emit("ANNOTATE_RUN_SESSION", { runId: Number(runId), progress: Math.round((100 / run.data.sessions.length) * completedSessions), status: 'RUNNING' });
  }

  await updateDocument({
    collection: 'runs',
    match: { _id: Number(runId) },
    update: {
      isRunning: false,
      isComplete: true,
      hasErrored,
      finishedAt: new Date()
    }
  });

  emitter.emit("ANNOTATE_RUN_SESSION", { runId: Number(runId), progress: 100, status: 'DONE' });

}