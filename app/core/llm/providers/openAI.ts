import { OpenAI } from 'openai';
import registerLLM from "../helpers/registerLLM.js";
import type { LLMSettings } from "../llm.types";
import { DEFAULT_LLM_SETTINGS } from "../llm.types";

registerLLM('OPEN_AI', {
  init: () => {
    const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
    return openai;
  },
  createChat: async ({ llm, options, messages, llmSettings = DEFAULT_LLM_SETTINGS }: { 
    llm: any; 
    options: any; 
    messages: Array<{ role: string; content: string }>; 
    llmSettings?: LLMSettings; 
  }) => {
    const { quality } = options;

    const chatCompletion = await llm.chat.completions.create({
      model: quality === 'medium' ? "gpt-3.5-turbo" : "gpt-4o",
      messages: messages,
      response_format: { type: llmSettings.responseFormat === 'json' ? "json_object" : "text" },
      temperature: llmSettings.temperature,
      max_tokens: llmSettings.maxTokens,
      top_p: llmSettings.topP,
      frequency_penalty: llmSettings.frequencyPenalty,
      presence_penalty: llmSettings.presencePenalty,
      stream: llmSettings.stream
    });

    if (llmSettings.responseFormat === 'json') {
      return JSON.parse(chatCompletion.choices[0].message.content);
    } else {
      return chatCompletion.choices[0].message.content;
    }
  }
});