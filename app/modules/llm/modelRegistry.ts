import aiGatewayConfig from "~/config/ai_gateway.json";
import type { ModelInfo, PricingTier, Provider } from "./model.types";

type ConfigModel = (typeof aiGatewayConfig.providers)[number]["models"][number];

function isActive(model: ConfigModel & { deprecated?: boolean }): boolean {
  return !model.deprecated;
}

export function getDefaultModelCode(): string {
  return aiGatewayConfig.defaultModel;
}

export function getAvailableProviders(): Provider[] {
  return aiGatewayConfig.providers
    .map((provider) => ({
      name: provider.name,
      models: provider.models.filter(isActive).map((m) => ({
        code: m.code,
        name: m.name,
        pricing: m.pricing as PricingTier[],
      })),
    }))
    .filter((provider) => provider.models.length > 0);
}

export function getAvailableModels(): ModelInfo[] {
  return aiGatewayConfig.providers.flatMap((provider) =>
    provider.models.filter(isActive).map((m) => ({
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
        deprecated: (model as ConfigModel & { deprecated?: boolean })
          .deprecated,
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
