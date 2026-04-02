import { OpenAI } from "openai";
import applySchemaToRequest from "../helpers/applySchemaToRequest";
import registerLLM from "../helpers/registerLLM";

registerLLM("AI_GATEWAY", {
  init: (config?: { timeout?: number }) => {
    const openai = new OpenAI({
      apiKey: process.env.AI_GATEWAY_KEY,
      baseURL: process.env.AI_GATEWAY_BASE_URL,
      maxRetries: 0,
      timeout: config?.timeout ?? 180_000,
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
      stream: true,
      stream_options: { include_usage: true },
    };

    applySchemaToRequest(requestParams, schema);

    const requestOptions: Record<string, any> = {};
    if (options.timeout) {
      requestOptions.headers = {
        "x-litellm-timeout": String(options.timeout / 1000),
      };
    }

    const { data: stream, response } = await llm.chat.completions
      .create(requestParams, requestOptions)
      .withResponse();

    let contentStr = "";
    let toolCallArgs = "";
    let usage: { prompt_tokens?: number; completion_tokens?: number } = {};

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        contentStr += delta.content;
      }
      if (delta?.tool_calls?.[0]?.function?.arguments) {
        toolCallArgs += delta.tool_calls[0].function.arguments;
      }
      if (chunk.usage) {
        usage = chunk.usage;
      }
    }

    const content = toolCallArgs
      ? JSON.parse(toolCallArgs)
      : JSON.parse(contentStr);

    const litellmHeaders: Record<string, string> = {};
    response.headers.forEach((value: string, key: string) => {
      if (key.startsWith("x-litellm")) {
        litellmHeaders[key] = value;
      }
    });

    const providerCostHeader = response.headers.get("x-litellm-response-cost");

    return {
      content,
      usage: {
        inputTokens: usage?.prompt_tokens ?? 0,
        outputTokens: usage?.completion_tokens ?? 0,
        providerCost:
          providerCostHeader && Number.isFinite(parseFloat(providerCostHeader))
            ? parseFloat(providerCostHeader)
            : 0,
      },
    };
  },
});
