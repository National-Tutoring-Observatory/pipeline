import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import fse from 'fs-extra';
import find from 'lodash/find.js';
import systemPrompt from "./system.prompt.json";
import LLM from '~/core/llm/llm';
import getStorageAdapter from '~/core/storage/helpers/getStorageAdapter';
import path from 'path';

export const handler = async (event: { body: any }) => {

  const { body } = event;
  const { inputFile, outputFolder, prompt, model } = body;

  const storage = getStorageAdapter();

  if (!storage) {
    throw new Error('Storage is undefined. Failed to initialize storage.');
  }

  await storage.download({ downloadPath: inputFile });

  const data = await fse.readFile(path.join('tmp', inputFile));

  const inputFileSplit = inputFile.split('/');
  const outputFileName = inputFileSplit[inputFileSplit.length - 1].replace('.json', '');

  const originalJSON = JSON.parse(data.toString());

  const llm = new LLM({ quality: 'high', model });

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
