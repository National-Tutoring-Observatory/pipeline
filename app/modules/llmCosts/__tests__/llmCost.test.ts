import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { LlmCostService } from "../llmCost";

describe("LlmCostService", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  const teamId = new Types.ObjectId().toString();

  const baseCost = {
    team: teamId,
    model: "nto.google.gemini-3-flash-preview",
    source: "annotation:per-session",
    inputTokens: 500,
    outputTokens: 100,
    cost: 0.00055,
    providerCost: 0.00055,
  };

  it("creates and returns a cost record", async () => {
    const result = await LlmCostService.create(baseCost);

    expect(result._id).toBeDefined();
    expect(result.team).toBe(teamId);
    expect(result.model).toBe(baseCost.model);
    expect(result.source).toBe(baseCost.source);
    expect(result.inputTokens).toBe(500);
    expect(result.outputTokens).toBe(100);
    expect(result.cost).toBe(0.00055);
    expect(result.providerCost).toBe(0.00055);
    expect(result.createdAt).toBeDefined();
  });

  it("stores optional sourceId", async () => {
    const sourceId = new Types.ObjectId().toString();
    const result = await LlmCostService.create({
      ...baseCost,
      sourceId,
    });

    expect(result.sourceId).toBe(sourceId);
  });

  it("finds records by team", async () => {
    const otherTeam = new Types.ObjectId().toString();
    await LlmCostService.create(baseCost);
    await LlmCostService.create({ ...baseCost, team: otherTeam });
    await LlmCostService.create(baseCost);

    const results = await LlmCostService.findByTeam(teamId);
    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r.team).toBe(teamId));
  });

  it("finds records by sourceId", async () => {
    const sourceId = new Types.ObjectId().toString();
    await LlmCostService.create({ ...baseCost, sourceId });
    await LlmCostService.create({ ...baseCost, sourceId });
    await LlmCostService.create(baseCost);

    const results = await LlmCostService.findBySourceId(sourceId);
    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r.sourceId).toBe(sourceId));
  });

  describe("getOutputToInputRatio", () => {
    it("returns null when no annotation records exist", async () => {
      const result = await LlmCostService.getOutputToInputRatio(teamId);
      expect(result).toBeNull();
    });

    it("returns null when records exist but not for annotation source", async () => {
      await LlmCostService.create({ ...baseCost, source: "billing:check" });
      const result = await LlmCostService.getOutputToInputRatio(teamId);
      expect(result).toBeNull();
    });

    it("returns null when no records exist for the team", async () => {
      const otherTeam = new Types.ObjectId().toString();
      await LlmCostService.create({ ...baseCost, team: otherTeam });
      const result = await LlmCostService.getOutputToInputRatio(teamId);
      expect(result).toBeNull();
    });

    it("computes weighted output/input ratio across annotation records", async () => {
      await LlmCostService.create({
        ...baseCost,
        source: "annotation:per-session",
        inputTokens: 1000,
        outputTokens: 200,
      });
      await LlmCostService.create({
        ...baseCost,
        source: "annotation:per-utterance",
        inputTokens: 500,
        outputTokens: 300,
      });

      const result = await LlmCostService.getOutputToInputRatio(teamId);
      // totalInput = 1500, totalOutput = 500 → ratio = 500/1500 ≈ 0.333
      expect(result).toBeCloseTo(500 / 1500, 5);
    });

    it("excludes non-annotation sources from the ratio", async () => {
      await LlmCostService.create({
        ...baseCost,
        source: "annotation:per-session",
        inputTokens: 1000,
        outputTokens: 200,
      });
      await LlmCostService.create({
        ...baseCost,
        source: "billing:check",
        inputTokens: 9999,
        outputTokens: 9999,
      });

      const result = await LlmCostService.getOutputToInputRatio(teamId);
      expect(result).toBeCloseTo(200 / 1000, 5);
    });
  });
});
