import { OpenAI } from 'openai';
import registerLLM from "../helpers/registerLLM";

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
  createChat: async ({ llm, options, messages }: { llm: any; options: any; messages: Array<{ role: string; content: string }> }) => {
    const { quality, model, user } = options;

    // @ts-ignore
    let modelName = AI_GATEWAY_PROVIDERS[model][quality];

    let metadata: any = {};

    if (user) {
      metadata.tags = [user]
    }

    const chatCompletion = await llm.chat.completions.create({
      user,
      model: modelName,
      messages: messages,
      response_format: { type: "json_object" },
      metadata
    });

    return JSON.parse(chatCompletion.choices[0].message.content);

  }
});
