import Decimal from "decimal.js";
import type { PricingTier } from "../model.types";
import { getModelPricing } from "../modelRegistry";

function selectTier(
  tiers: PricingTier[],
  inputTokens: number,
): PricingTier | null {
  for (const tier of tiers) {
    if (tier.upToInputTokens == null || inputTokens <= tier.upToInputTokens) {
      return tier;
    }
  }
  return null;
}

export default function calculateCost({
  modelCode,
  inputTokens,
  outputTokens,
}: {
  modelCode: string;
  inputTokens: number;
  outputTokens: number;
}): number {
  const tiers = getModelPricing(modelCode);
  if (tiers.length === 0) {
    throw new Error(`No pricing found for model: ${modelCode}`);
  }

  const tier = selectTier(tiers, inputTokens);
  if (!tier) {
    throw new Error(
      `No matching pricing tier for model ${modelCode} with ${inputTokens} input tokens`,
    );
  }

  const inputCost = new Decimal(inputTokens)
    .div(1_000_000)
    .mul(tier.inputCostPer1M);
  const outputCost = new Decimal(outputTokens)
    .div(1_000_000)
    .mul(tier.outputCostPer1M);

  return inputCost.plus(outputCost).toNumber();
}
