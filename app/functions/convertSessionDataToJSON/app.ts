import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import fse from 'fs-extra';
import LLM from '../../core/llm/llm';
import schema from "./schema.json";
import orchestratorPrompt from './orchestrator.prompt.json';
import systemPrompt from './system.prompt.json';
import userPrompt from './user.prompt.json';
import getStorageAdapter from '~/core/storage/helpers/getStorageAdapter';
import path from 'path';

interface RequestBody {
  inputFile: string;
  outputFolder: string;
}

interface LambdaEvent {
  body: RequestBody;
}

interface LambdaResponse {
  statusCode: number;
  body?: string;
}

export const handler = async (event: LambdaEvent) => {
  const { body } = event;
  const { inputFile, outputFolder } = body;

  const storage = getStorageAdapter();

  if (!storage) {
    throw new Error('Storage is undefined. Failed to initialize storage.');
  }

  await storage.download({ downloadPath: inputFile });

  const data = await fse.readFile(path.join('tmp', inputFile));

  const outputFileName = path.basename(inputFile).replace('.json', '').replace('.vtt', '');

  const llm = new LLM({ quality: 'high', retries: 3, model: 'GEMINI' })

  llm.setOrchestratorMessage(orchestratorPrompt.prompt, { schema: JSON.stringify(schema) });

  llm.addSystemMessage(systemPrompt.prompt, {});

  llm.addUserMessage(userPrompt.prompt, { schema: JSON.stringify(schema), data });

  const response = await llm.createChat();

  await fse.outputJSON(`tmp/${outputFolder}/${outputFileName}.json`, response);

  const buffer = await fse.readFile(`tmp/${outputFolder}/${outputFileName}.json`);

  await storage.upload({ file: { buffer, size: buffer.length, type: 'application/json' }, uploadPath: `${outputFolder}/${outputFileName}.json` });

};
