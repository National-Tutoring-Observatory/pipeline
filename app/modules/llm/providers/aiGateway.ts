import { OpenAI } from "openai";
import applySchemaToRequest from "../helpers/applySchemaToRequest";
import registerLLM from "../helpers/registerLLM";

registerLLM("AI_GATEWAY", {
  init: () => {
    const openai = new OpenAI({
      apiKey: process.env.AI_GATEWAY_KEY,
      baseURL: process.env.AI_GATEWAY_BASE_URL,
      maxRetries: 0,
      timeout: 180_000,
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

    const metadata: any = {};

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

    const { data: chatCompletion, response } = await llm.chat.completions
      .create(requestParams)
      .withResponse();
    const message = chatCompletion.choices[0].message;

    const content =
      message.tool_calls?.length > 0
        ? JSON.parse(message.tool_calls[0].function.arguments)
        : JSON.parse(message.content);

    const providerCostHeader = response.headers.get("x-litellm-response-cost");

    return {
      content,
      usage: {
        inputTokens: chatCompletion.usage?.prompt_tokens ?? 0,
        outputTokens: chatCompletion.usage?.completion_tokens ?? 0,
        providerCost:
          providerCostHeader && Number.isFinite(parseFloat(providerCostHeader))
            ? parseFloat(providerCostHeader)
            : 0,
      },
    };
  },
});
