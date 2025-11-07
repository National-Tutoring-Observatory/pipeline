import fse from 'fs-extra';
import map from 'lodash/map.js';
import path from 'path';
import updateRunSession from 'workers/helpers/updateRunSession';
import LLM from '~/modules/llm/llm';
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';
import annotationPerSessionPrompts from "../prompts/annotatePerSession.prompts.json";

export default async function annotationPerSession(job: any) {

  const { runId, sessionId, inputFile, outputFolder, prompt, model, team } = job.data;

  await updateRunSession({
    runId,
    sessionId,
    update: {
      status: 'RUNNING',
      startedAt: new Date()
    }
  })

  const storage = getStorageAdapter();

  await storage.download({ downloadPath: inputFile });

  const data = await fse.readFile(path.join('tmp', inputFile));

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

};
