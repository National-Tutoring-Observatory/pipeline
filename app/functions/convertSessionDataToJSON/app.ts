import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import fse from 'fs-extra';
import LLM from '../../core/llm/llm';
import schema from "./schema.json";
import orchestratorPrompt from './orchestrator.prompt.json';
import systemPrompt from './system.prompt.json';
import userPrompt from './user.prompt.json';

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

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  try {
    const { body } = event;
    const { inputFile, outputFolder } = body;

    if (!await fs.existsSync(inputFile)) throw { message: 'This input file does not exist' };

    const data = await fse.readFile(inputFile, { encoding: 'utf8' });

    const inputFileSplit = inputFile.split('/');
    const outputFileName = inputFileSplit[inputFileSplit.length - 1].replace('.json', '').replace('.vtt', '');

    const llm = new LLM({ quality: 'high', retries: 3 })

    llm.setOrchestratorMessage(orchestratorPrompt.prompt, { schema: JSON.stringify(schema) });

    llm.addSystemMessage(systemPrompt.prompt, {});

    llm.addUserMessage(userPrompt.prompt, { schema: JSON.stringify(schema), data });

    const response = await llm.createChat();

    await fse.outputJSON(`${outputFolder}/${outputFileName}.json`, response);

    return {
      statusCode: 200,
    };

  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err
      }),
    };
  }
};
