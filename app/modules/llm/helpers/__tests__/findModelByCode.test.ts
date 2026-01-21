import { describe, it, expect } from "vitest";
import findModelByCode from "../findModelByCode";
import aiGatewayConfig from "~/config/ai_gateway.json";

describe("findModelByCode", () => {
  it("should find any valid model code from config", () => {
    // Pick first model from first provider
    const firstProvider = aiGatewayConfig.providers[0];
    const firstModel = firstProvider.models[0];

    const result = findModelByCode(firstModel.code);

    expect(result).not.toBeNull();
    expect(result?.code).toBe(firstModel.code);
    expect(result?.name).toBe(firstModel.name);
    expect(result?.provider).toBe(firstProvider.name);
  });

  it("should return null for unknown code", () => {
    const result = findModelByCode("nonexistent.code");
    expect(result).toBeNull();
  });

  it("should return null for empty string", () => {
    const result = findModelByCode("");
    expect(result).toBeNull();
  });

  it("should be case-sensitive", () => {
    const firstProvider = aiGatewayConfig.providers[0];
    const firstModel = firstProvider.models[0];

    const result = findModelByCode(firstModel.code.toUpperCase());
    expect(result).toBeNull();
  });
});
