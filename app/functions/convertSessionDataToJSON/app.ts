import dotenv from 'dotenv';
import fse from 'fs-extra';
import path from 'path';
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';
import LLM from '../../modules/llm/llm';
import aiGatewayConfig from '~/config/ai_gateway.json';
import orchestratorPrompt from './orchestrator.prompt.json';
import schema from "./schema.json";
import systemPrompt from './system.prompt.json';
import userPrompt from './user.prompt.json';
dotenv.config({ path: '.env' });

interface LambdaEvent {
  body: any;
}

export const handler = async (event: LambdaEvent) => {
  const { body } = event;
  const { inputFile, outputFolder, team } = body;

  const storage = getStorageAdapter();

  const downloadedPath = await storage.download({ sourcePath: inputFile });
  const data = await fse.readFile(downloadedPath);

  const outputFileName = path.basename(inputFile).replace('.json', '').replace('.vtt', '');

  const llm = new LLM({ retries: 3, model: aiGatewayConfig.defaultModel, user: team })

  llm.setOrchestratorMessage(orchestratorPrompt.prompt, { schema: JSON.stringify(schema) });

  llm.addSystemMessage(systemPrompt.prompt, {});

  llm.addUserMessage(userPrompt.prompt, { schema: JSON.stringify(schema), data });

  const response = await llm.createChat();

  await fse.outputJSON(`tmp/${outputFolder}/${outputFileName}.json`, response);

  const buffer = await fse.readFile(`tmp/${outputFolder}/${outputFileName}.json`);

  await storage.upload({ file: { buffer, size: buffer.length, type: 'application/json' }, uploadPath: `${outputFolder}/${outputFileName}.json` });

};
