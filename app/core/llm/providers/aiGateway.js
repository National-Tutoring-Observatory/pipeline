import { OpenAI } from 'openai';
import registerLLM from "../helpers/registerLLM.js";

const AI_GATEWAY_PROVIDERS = {
  OPEN_AI: {
    "medium": "openai.gpt-4.1-mini",
    "high": "openai.gpt-4.1"
  },
  GEMINI: {
    "medium": "google.gemini-2.0-flash-lite",
    "high": "google.gemini-2.5-flash-preview"
  }
}

registerLLM('AI_GATEWAY', {
  init: () => {
    const openai = new OpenAI({
      apiKey: process.env.AI_GATEWAY_KEY,
      baseURL: process.env.AI_GATEWAY_BASE_URL
    });
    return openai;
  },
  createChat: async ({ llm, options, messages }) => {

    const { quality } = options;

    let model = AI_GATEWAY_PROVIDERS[process.env.AI_GATEWAY_PROVIDER || 'GEMINI'][quality];

    const chatCompletion = await llm.chat.completions.create({
      model,
      messages: messages,
      response_format: { type: "json_object" }
    });

    return JSON.parse(chatCompletion.choices[0].message.content);

  }
});