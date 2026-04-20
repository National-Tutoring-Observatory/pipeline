import calculateCost from "~/modules/llm/helpers/calculateCost";
import type { EstimationResult } from "~/modules/runSets/runSets.types";

const AVG_TOKENS_PER_SESSION = 500;
const DEFAULT_SECONDS_PER_CALL = 10;
const DEFAULT_PARALLELISM_FACTOR = 5;
const DEFAULT_RATIO = 1.0;
export function getCostBufferMultiplier(rawCost: number): number {
  if (rawCost <= 1) return 1.2;
  if (rawCost <= 10) return 1.5;
  return 1.8;
}

interface CalculateEstimatesOptions {
  shouldRunVerification?: boolean;
  avgSecondsPerSession?: number | null;
  outputToInputRatio?: number | null;
}

export function calculateEstimates(
  runDefinitions: Array<{
    modelCode: string;
    prompt?: { inputTokens?: number };
  }>,
  selectedSessions: Array<{ inputTokens?: number }>,
  options?: CalculateEstimatesOptions,
): EstimationResult {
  const numSessions = selectedSessions.length;
  const verificationMultiplier = options?.shouldRunVerification ? 2 : 1;

  const sessionInputTokens = selectedSessions.reduce((sum, s) => {
    return sum + (s.inputTokens ? s.inputTokens : AVG_TOKENS_PER_SESSION / 2);
  }, 0);

  const rawRatio = options?.outputToInputRatio;
  const ratio = rawRatio != null && rawRatio > 0 ? rawRatio : DEFAULT_RATIO;

  let totalCost = 0;
  for (const definition of runDefinitions) {
    const promptTokens = definition.prompt?.inputTokens ?? 0;
    const defInputTokens = sessionInputTokens + promptTokens * numSessions;
    const defOutputTokens = defInputTokens * ratio;
    totalCost +=
      verificationMultiplier *
      calculateCost({
        modelCode: definition.modelCode,
        inputTokens: defInputTokens,
        outputTokens: defOutputTokens,
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
    estimatedCost: totalCost * getCostBufferMultiplier(totalCost),
    estimatedTimeSeconds,
  };
}
