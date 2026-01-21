import { OpenAI } from "openai";
import registerLLM from "../helpers/registerLLM.js";

registerLLM("OPEN_AI", {
  init: () => {
    const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
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
    const chatCompletion = await llm.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  },
});
