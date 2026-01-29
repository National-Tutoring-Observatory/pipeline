import { OpenAI } from "openai";
import registerLLM from "../helpers/registerLLM.js";
import { applySchemaToRequest } from "../helpers/applySchemaToRequest.js";

registerLLM("OPEN_AI", {
  init: () => {
    const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
    return openai;
  },
  createChat: async ({
    llm,
    options,
    messages,
    schema,
  }: {
    llm: any;
    options: any;
    messages: Array<{ role: string; content: string }>;
    schema?: object;
  }) => {
    const requestParams: any = {
      model: "gpt-4o",
      messages: messages,
    };

    applySchemaToRequest(requestParams, schema);

    const chatCompletion = await llm.chat.completions.create(requestParams);
    const message = chatCompletion.choices[0].message;

    if (message.tool_calls?.length > 0) {
      return JSON.parse(message.tool_calls[0].function.arguments);
    }

    return JSON.parse(message.content);
  },
});
