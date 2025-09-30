import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import fse from 'fs-extra';
import systemPrompt from "./system.prompt.json";
import LLM from '~/modules/llm/llm';
import map from 'lodash/map.js';
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';
import path from 'path';

export const handler = async (event: { body: any }) => {

  const { body } = event;
  const { inputFile, outputFolder, prompt, model, team } = body;

  const storage = getStorageAdapter();

  await storage.download({ downloadPath: inputFile });

  const data = await fse.readFile(path.join('tmp', inputFile));

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

  originalJSON.annotations = map(response.annotations || [], (annotation: any, index: number) => {
    annotation._id = `${index}`;
    return annotation;
  })

  await fse.outputJSON(`tmp/${outputFolder}/${outputFileName}.json`, originalJSON);

  const buffer = await fse.readFile(`tmp/${outputFolder}/${outputFileName}.json`);

  await storage.upload({ file: { buffer, size: buffer.length, type: 'application/json' }, uploadPath: `${outputFolder}/${outputFileName}.json` });

};
