import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import fse from 'fs-extra';
import find from 'lodash/find.js';
import systemPrompt from "./system.prompt.json";
import LLM from '~/core/llm/llm';
import map from 'lodash/map.js';

export const handler = async (event: { body: any }) => {

  const { body } = event;
  const { inputFile, outputFolder, prompt, model, llmSettings } = body;

  if (!await fs.existsSync(inputFile)) throw { message: 'This input file does not exist' };

  const data = await fse.readFile(inputFile, { encoding: 'utf8' });

  const inputFileSplit = inputFile.split('/');
  const outputFileName = inputFileSplit[inputFileSplit.length - 1].replace('.json', '');

  const originalJSON = JSON.parse(data);

  const llm = new LLM({ quality: 'high', model, llmSettings });

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

  await fse.outputJSON(`${outputFolder}/${outputFileName}.json`, originalJSON);

};
