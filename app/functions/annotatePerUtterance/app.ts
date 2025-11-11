import dotenv from 'dotenv';
import fse from 'fs-extra';
import find from 'lodash/find.js';
import LLM from '~/modules/llm/llm';
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';
import systemPrompt from "./system.prompt.json";
dotenv.config({ path: '.env' });

export const handler = async (event: { body: any }) => {

  const { body } = event;
  const { inputFile, outputFolder, prompt, model, team } = body;

  const storage = getStorageAdapter();

  const downloadedPath = await storage.download({ sourcePath: inputFile });
  const data = await fse.readFile(downloadedPath);

  const inputFileSplit = inputFile.split('/');
  const outputFileName = inputFileSplit[inputFileSplit.length - 1].replace('.json', '');

  const originalJSON = JSON.parse(data.toString());

  const llm = new LLM({ quality: 'high', model, user: team });

  llm.addSystemMessage(systemPrompt.prompt, {
    annotationSchema: JSON.stringify(prompt.annotationSchema)
  });

  llm.addUserMessage(`${prompt.prompt}\n\nConversation: {{conversation}}`, {
    conversation: data
  })

  const response = await llm.createChat();

  const annotations = response.annotations || [];

  for (const annotation of annotations) {
    const currentUtterance = find(originalJSON.transcript, { _id: annotation._id });
    currentUtterance.annotations = [...currentUtterance.annotations, annotation];
  }

  await fse.outputJSON(`tmp/${outputFolder}/${outputFileName}.json`, originalJSON);

  const buffer = await fse.readFile(`tmp/${outputFolder}/${outputFileName}.json`);

  await storage.upload({ file: { buffer, size: buffer.length, type: 'application/json' }, uploadPath: `${outputFolder}/${outputFileName}.json` });

};
