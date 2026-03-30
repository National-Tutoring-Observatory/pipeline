import calculateCost from "~/modules/llm/helpers/calculateCost";
import type { EstimationResult } from "~/modules/runSets/runSets.types";

const AVG_TOKENS_PER_SESSION = 500;
const DEFAULT_SECONDS_PER_CALL = 10;
const DEFAULT_PARALLELISM_FACTOR = 5;
const DEFAULT_RATIO = 1.0;
const COST_BUFFER_MULTIPLIER = 1.5;

interface CalculateEstimatesOptions {
  shouldRunVerification?: boolean;
  avgSecondsPerSession?: number | null;
  outputToInputRatio?: number | null;
}

export function calculateEstimates(
  runDefinitions: Array<{ modelCode: string }>,
  selectedSessions: Array<{ inputTokens?: number }>,
  options?: CalculateEstimatesOptions,
): EstimationResult {
  const numSessions = selectedSessions.length;
  const verificationMultiplier = options?.shouldRunVerification ? 2 : 1;

  const totalInputTokens = selectedSessions.reduce((sum, s) => {
    return sum + (s.inputTokens ? s.inputTokens : AVG_TOKENS_PER_SESSION / 2);
  }, 0);

  const rawRatio = options?.outputToInputRatio;
  const ratio = rawRatio != null && rawRatio > 0 ? rawRatio : DEFAULT_RATIO;
  const totalOutputTokens = totalInputTokens * ratio;

  const definitionsByModel = new Map<string, number>();
  for (const definition of runDefinitions) {
    definitionsByModel.set(
      definition.modelCode,
      (definitionsByModel.get(definition.modelCode) || 0) + 1,
    );
  }

  let totalCost = 0;
  for (const [modelCode, count] of definitionsByModel) {
    totalCost +=
      count *
      verificationMultiplier *
      calculateCost({
        modelCode,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      });
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

  return {
    estimatedCost: totalCost * COST_BUFFER_MULTIPLIER,
    estimatedTimeSeconds,
  };
}
