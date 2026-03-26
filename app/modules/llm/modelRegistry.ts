import aiGatewayConfig from "~/config/ai_gateway.json";
import type { ModelInfo, PricingTier, Provider } from "./model.types";

export function getDefaultModelCode(): string {
  return aiGatewayConfig.defaultModel;
}

export function getAvailableProviders(): Provider[] {
  return aiGatewayConfig.providers.map((provider) => ({
    name: provider.name,
    models: provider.models.map((m) => ({
      code: m.code,
      name: m.name,
      pricing: m.pricing as PricingTier[],
    })),
  }));
}

export function getAvailableModels(): ModelInfo[] {
  return aiGatewayConfig.providers.flatMap((provider) =>
    provider.models.map((m) => ({
      code: m.code,
      name: m.name,
      provider: provider.name,
      pricing: m.pricing as PricingTier[],
    })),
  );
}

export function findModelByCode(code: string): ModelInfo | null {
  for (const provider of aiGatewayConfig.providers) {
    const model = provider.models.find((m) => m.code === code);
    if (model) {
      return {
        code: model.code,
        name: model.name,
        provider: provider.name,
        pricing: model.pricing as PricingTier[],
      };
    }
  }
  return null;
}

export function getModelPricing(code: string): PricingTier[] {
  const model = findModelByCode(code);
  return model?.pricing ?? [];
}
