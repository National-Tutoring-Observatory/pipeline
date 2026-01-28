import aiGatewayConfig from "~/config/ai_gateway.json";
import type { EstimationResult } from "~/modules/collections/collections.types";
import type { Provider } from "~/modules/llm/model.types";

const AVG_TOKENS_PER_SESSION = 500;
const AVG_SECONDS_PER_CALL = 2;
const PARALLELISM_FACTOR = 3;

function getModelPricing(modelCode: string) {
  const providers = aiGatewayConfig.providers as Provider[];

  for (const provider of providers) {
    const model = provider.models.find((m) => m.code === modelCode);
    if (model) {
      return {
        inputCostPer1M: model.inputCostPer1M ?? 0,
        outputCostPer1M: model.outputCostPer1M ?? 0,
      };
    }
  }

  return { inputCostPer1M: 0, outputCostPer1M: 0 };
}

export function calculateEstimates(
  selectedPrompts: { length: number },
  selectedModels: string[],
  selectedSessions: { length: number },
): EstimationResult {
  const numPrompts = selectedPrompts.length;
  const numModels = selectedModels.length;
  const numSessions = selectedSessions.length;

  const inputTokens = AVG_TOKENS_PER_SESSION / 2;
  const outputTokens = AVG_TOKENS_PER_SESSION / 2;

  let totalCost = 0;
  for (const modelCode of selectedModels) {
    const pricing = getModelPricing(modelCode);
    totalCost +=
      numPrompts *
      numSessions *
      ((inputTokens / 1_000_000) * pricing.inputCostPer1M +
        (outputTokens / 1_000_000) * pricing.outputCostPer1M);
  }

  const totalCalls = numPrompts * numModels * numSessions;
  const estimatedTimeSeconds =
    (totalCalls * AVG_SECONDS_PER_CALL) / PARALLELISM_FACTOR;

  return { estimatedCost: totalCost, estimatedTimeSeconds };
}
