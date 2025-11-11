import fse from 'fs-extra';
import filter from 'lodash/filter';
import map from 'lodash/map.js';
import emitFromJob from 'workers/helpers/emitFromJob';
import updateRunSession from 'workers/helpers/updateRunSession';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import LLM from '~/modules/llm/llm';
import type { Run } from '~/modules/runs/runs.types';
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';
import annotationPerSessionPrompts from "../prompts/annotatePerSession.prompts.json";

export default async function annotatePerSession(job: any) {

  const { projectId, runId, sessionId, inputFile, outputFolder, prompt, model, team } = job.data;

  try {
    await updateRunSession({
      runId,
      sessionId,
      update: {
        status: 'RUNNING',
        startedAt: new Date()
      }
    });

    await emitFromJob(job, {
      runId,
      sessionId
    }, 'STARTED');

    const storage = getStorageAdapter();

    const downloadedPath = await storage.download({ sourcePath: inputFile });
    const data = await fse.readFile(downloadedPath);

    const inputFileSplit = inputFile.split('/');
    const outputFileName = inputFileSplit[inputFileSplit.length - 1].replace('.json', '');

    const originalJSON = JSON.parse(data.toString());

    const llm = new LLM({ quality: 'high', model, user: team });

    llm.addSystemMessage(annotationPerSessionPrompts.system, {
      annotationSchema: JSON.stringify(prompt.annotationSchema)
    });

    llm.addUserMessage(`${prompt.prompt}\n\nConversation: {{conversation}}`, {
      conversation: data
    })

    const response = await llm.createChat();

    originalJSON.annotations = map(response.annotations || [], (annotation: any, index: number) => {
      annotation._id = `${index}`;
      return annotation;
    })

    await fse.outputJSON(`tmp/${outputFolder}/${outputFileName}.json`, originalJSON);

    const buffer = await fse.readFile(`tmp/${outputFolder}/${outputFileName}.json`);

    await storage.upload({ file: { buffer, size: buffer.length, type: 'application/json' }, uploadPath: `${outputFolder}/${outputFileName}.json` });

    await fse.remove(`tmp/${outputFolder}/${outputFileName}.json`);

    await updateRunSession({
      runId,
      sessionId,
      update: {
        status: 'DONE',
        finishedAt: new Date(),
      }
    });

    const documents = getDocumentsAdapter();

    const run = await documents.getDocument({ collection: 'runs', match: { _id: runId } }) as { data: Run };

    const sessionsCount = run.data.sessions.length;

    const completedSessionsCount = filter(run.data.sessions, { status: 'DONE' }).length;

    await emitFromJob(job, {
      runId,
      sessionId,
      progress: Math.round((100 / sessionsCount) * completedSessionsCount),
      step: `${completedSessionsCount}/${sessionsCount}`
    }, 'FINISHED');

    return {
      status: 'SUCCESS'
    }

  } catch (error: any) {
    await updateRunSession({
      runId,
      sessionId,
      update: {
        status: 'ERRORED',
        finishedAt: new Date(),
      }
    });
    await emitFromJob(job, {
      runId,
      sessionId
    }, 'ERRORED');
    return {
      status: 'ERRORED',
      error: error.message
    }
  }

};
