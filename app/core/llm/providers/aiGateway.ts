import { OpenAI } from 'openai';
import registerLLM from "../helpers/registerLLM";
import type { LLMSettings } from "../llm.types";
import { DEFAULT_LLM_SETTINGS } from "../llm.types";

const AI_GATEWAY_PROVIDERS = {
  CHAT_GPT: {
    "medium": "openai.gpt-4.1-mini",
    "high": "openai.gpt-4.1"
  },
  GEMINI: {
    "medium": "google.gemini-2.0-flash-lite",
    "high": "google.gemini-2.5-flash"
  },
  CLAUDE: {
    "medium": "anthropic.claude-3.7-sonnet",
    "high": "anthropic.claude-4-sonnet"
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
  createChat: async ({ llm, options, messages, modelSettings = DEFAULT_LLM_SETTINGS }: { 
    llm: any; 
    options: any; 
    messages: Array<{ role: string; content: string }>; 
    modelSettings?: LLMSettings; 
  }) => {
    const { quality, model } = options;
    // @ts-ignore
    let modelName = AI_GATEWAY_PROVIDERS[model][quality];

    const chatCompletion = await llm.chat.completions.create({
      model: modelName,
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