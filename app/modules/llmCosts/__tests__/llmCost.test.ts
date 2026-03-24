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
});
