import { OpenAI } from 'openai';
import registerLLM from "../helpers/registerLLM.js";

registerLLM('OPEN_AI', {
  init: () => {
    const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
    return openai;
  },
  createChat: async ({ llm, options, messages }) => {

    const { quality } = options;

    const chatCompletion = await llm.chat.completions.create({
      model: quality === 'medium' ? "gpt-3.5-turbo" : "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" }
    });

    return JSON.parse(chatCompletion.choices[0].message.content);

  }
});