import aiGatewayConfig from "~/config/ai_gateway.json";
import type { ModelInfo } from "~/modules/llm/model.types";

/** Finds a model in config by code (e.g., 'google.gemini-2.5-flash') */
export function findModelByCode(modelCode: string): ModelInfo | null {
  for (const provider of aiGatewayConfig.providers) {
    const model = provider.models.find((m: any) => m.code === modelCode);
    if (model) {
      return {
        code: model.code,
        name: model.name,
        provider: provider.name,
      };
    }
  }
  return null;
}

export default findModelByCode;
