import { OpenAI } from "openai";
import applySchemaToRequest from "../helpers/applySchemaToRequest";
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
    schema,
  }: {
    llm: any;
    options: any;
    messages: Array<{ role: string; content: string }>;
    schema?: object;
  }) => {
    const { model, user } = options;

    let metadata: any = {};

    if (user) {
      metadata.tags = [user];
    }

    const requestParams: any = {
      user,
      model: model,
      messages: messages,
      metadata,
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
