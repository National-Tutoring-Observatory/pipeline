import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import fse from 'fs-extra';
import find from 'lodash/find.js';
import systemPrompt from "./system.prompt.json" with { type: "json" };
import prompts from "./prompts.json" with {type: "json"};
import LLM from '../../shared/llm/llm.js';

export const handler = async (event) => {
  try {
    const { body } = event;
    const { inputFile, outputFolder, promptId } = body;

    if (!await fs.existsSync(inputFile)) throw { message: 'This input file does not exist' };

    const data = await fse.readFile(inputFile, { encoding: 'utf8' });

    const inputFileSplit = inputFile.split('/');
    const outputFileName = inputFileSplit[inputFileSplit.length - 1].replace('.json', '');

    const prompt = find(prompts, { _id: promptId });
    const originalJSON = JSON.parse(data);

    const llm = new LLM({ quality: 'high' });

    llm.addSystemMessage(systemPrompt.prompt, {
      annotationSchema: JSON.stringify(prompt.annotationSchema)
    });

    llm.addUserMessage(`${prompt.prompt}\n\nConversation: {{conversation}}`, {
      conversation: data
    })

    const response = await llm.createChat();

    console.log(response);

    originalJSON.annotation = response || {};

    await fse.outputJSON(`${outputFolder}/${outputFileName}.json`, originalJSON);

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
