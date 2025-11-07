import fse from 'fs-extra';
import filter from 'lodash/filter';
import find from 'lodash/find.js';
import path from 'path';
import getSockets from 'workers/helpers/getSockets';
import updateRunSession from 'workers/helpers/updateRunSession';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import LLM from '~/modules/llm/llm';
import type { Run } from '~/modules/runs/runs.types';
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';
import annotationPerUtterancePrompts from "../prompts/annotatePerUtterance.prompts.json";

export default async function annotatePerUtterance(job: any) {

  const { runId, sessionId, inputFile, outputFolder, prompt, model, team } = job.data;

  await updateRunSession({
    runId, sessionId, update: {
      status: 'RUNNING',
      startedAt: new Date()
    }
  })

  const sockets = await getSockets();

  sockets.emit('ANNOTATE_RUN', {
    runId,
    sessionId,
    task: 'ANNOTATE_PER_UTTERANCE',
    status: 'STARTED'
  });

  const storage = getStorageAdapter();

  await storage.download({ downloadPath: inputFile });

  const data = await fse.readFile(path.join('tmp', inputFile));

  const inputFileSplit = inputFile.split('/');
  const outputFileName = inputFileSplit[inputFileSplit.length - 1].replace('.json', '');

  const originalJSON = JSON.parse(data.toString());

  const llm = new LLM({ quality: 'high', model, user: team });

  llm.addSystemMessage(annotationPerUtterancePrompts.system, {
    annotationSchema: JSON.stringify(prompt.annotationSchema)
  });

  llm.addUserMessage(`${prompt.prompt}\n\nConversation: {{conversation}}`, {
    conversation: data
  });

  const response = await llm.createChat();

  const annotations = response.annotations || [];

  for (const annotation of annotations) {
    const currentUtterance = find(originalJSON.transcript, { _id: annotation._id });
    currentUtterance.annotations = [...currentUtterance.annotations, annotation];
  }

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

  sockets.emit('ANNOTATE_RUN', {
    runId,
    sessionId,
    task: 'ANNOTATE_PER_UTTERANCE',
    status: 'FINISHED',
    progress: Math.round((100 / sessionsCount) * completedSessionsCount),
    step: `${completedSessionsCount}/${sessionsCount}`
  });

};
