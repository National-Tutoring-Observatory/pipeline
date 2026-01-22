import { OpenAI } from "openai";
import registerLLM from "../helpers/registerLLM";

registerLLM("AI_GATEWAY", {
  init: () => {
    const openai = new OpenAI({
      apiKey: process.env.AI_GATEWAY_KEY,
      baseURL: process.env.AI_GATEWAY_BASE_URL,
    });
    return openai;
  },
  createChat: async ({
    llm,
    options,
    messages,
  }: {
    llm: any;
    options: any;
    messages: Array<{ role: string; content: string }>;
  }) => {
    const { model, user } = options;

    let metadata: any = {};

    if (user) {
      metadata.tags = [user];
    }

    const chatCompletion = await llm.chat.completions.create({
      user,
      model: model,
      messages: messages,
      response_format: { type: "json_object" },
      metadata,
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  },
});
