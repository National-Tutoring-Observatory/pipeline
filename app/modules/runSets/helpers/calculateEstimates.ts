import aiGatewayConfig from "~/config/ai_gateway.json";
import type { Provider } from "~/modules/llm/model.types";
import type {
  EstimationResult,
  RunDefinition,
} from "~/modules/runSets/runSets.types";

const AVG_TOKENS_PER_SESSION = 500;
const DEFAULT_SECONDS_PER_CALL = 10;
const DEFAULT_PARALLELISM_FACTOR = 5;

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

interface CalculateEstimatesOptions {
  shouldRunVerification?: boolean;
  avgSecondsPerSession?: number | null;
}

export function calculateEstimates(
  runDefinitions: RunDefinition[],
  selectedSessions: { length: number },
  options?: CalculateEstimatesOptions,
): EstimationResult {
  const numSessions = selectedSessions.length;
  const verificationMultiplier = options?.shouldRunVerification ? 2 : 1;

  const inputTokens = AVG_TOKENS_PER_SESSION / 2;
  const outputTokens = AVG_TOKENS_PER_SESSION / 2;

  const definitionsByModel = new Map<string, number>();
  for (const definition of runDefinitions) {
    definitionsByModel.set(
      definition.modelCode,
      (definitionsByModel.get(definition.modelCode) || 0) + 1,
    );
  }

  let totalCost = 0;
  for (const [modelCode, count] of definitionsByModel) {
    const pricing = getModelPricing(modelCode);
    totalCost +=
      count *
      numSessions *
      verificationMultiplier *
      ((inputTokens / 1_000_000) * pricing.inputCostPer1M +
        (outputTokens / 1_000_000) * pricing.outputCostPer1M);
  }

  const totalCalls = runDefinitions.length * numSessions;
  const avgSecondsPerSession = options?.avgSecondsPerSession;

  // When using historical data, parallelism is already reflected in the average
  // since it's derived from wall-clock run duration divided by session count.
  let estimatedTimeSeconds: number;
  if (avgSecondsPerSession != null && avgSecondsPerSession > 0) {
    estimatedTimeSeconds =
      totalCalls * avgSecondsPerSession * verificationMultiplier;
  } else {
    estimatedTimeSeconds =
      (totalCalls * DEFAULT_SECONDS_PER_CALL * verificationMultiplier) /
      DEFAULT_PARALLELISM_FACTOR;
  }

  return { estimatedCost: totalCost, estimatedTimeSeconds };
}
