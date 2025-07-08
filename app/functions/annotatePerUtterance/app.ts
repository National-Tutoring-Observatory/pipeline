import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import fse from 'fs-extra';
import find from 'lodash/find.js';
import systemPrompt from "./system.prompt.json";
import prompts from "./prompts.json";
import LLM from '~/core/llm/llm';

export const handler = async (event) => {
  try {
    const { body } = event;
    const { inputFile, outputFolder, prompt } = body;

    if (!await fs.existsSync(inputFile)) throw { message: 'This input file does not exist' };

    const data = await fse.readFile(inputFile, { encoding: 'utf8' });

    const inputFileSplit = inputFile.split('/');
    const outputFileName = inputFileSplit[inputFileSplit.length - 1].replace('.json', '');

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

    const annotations = response || [];

    for (const annotation of annotations) {
      const currentUtterance = find(originalJSON.transcript, { _id: annotation._id });
      currentUtterance.annotations = [...currentUtterance.annotations, annotation];
    }

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
