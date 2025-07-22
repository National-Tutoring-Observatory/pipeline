import { OpenAI } from 'openai';
import registerLLM from "../helpers/registerLLM.js";
import type { LLMSettings } from "../llm.types";
import { DEFAULT_LLM_SETTINGS } from "../llm.types";

registerLLM('OPEN_AI', {
  init: () => {
    const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
    return openai;
  },
  createChat: async ({ llm, options, messages, modelSettings = DEFAULT_LLM_SETTINGS }: { 
    llm: any; 
    options: any; 
    messages: Array<{ role: string; content: string }>; 
    modelSettings?: LLMSettings; 
  }) => {
    const { quality } = options;

    const chatCompletion = await llm.chat.completions.create({
      model: quality === 'medium' ? "gpt-3.5-turbo" : "gpt-4o",
      messages: messages,
      response_format: { type: modelSettings.responseFormat === 'json' ? "json_object" : "text" },
      temperature: modelSettings.temperature,
      max_tokens: modelSettings.maxTokens,
      top_p: modelSettings.topP,
      frequency_penalty: modelSettings.frequencyPenalty,
      presence_penalty: modelSettings.presencePenalty,
      stream: modelSettings.stream
    });

    if (modelSettings.responseFormat === 'json') {
      return JSON.parse(chatCompletion.choices[0].message.content);
    } else {
      return chatCompletion.choices[0].message.content;
    }
  }
});