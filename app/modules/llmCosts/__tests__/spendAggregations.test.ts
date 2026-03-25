import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { LlmCostService } from "../llmCost";

describe("LlmCostService spend aggregations", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  const teamId = new Types.ObjectId().toString();
  const otherTeamId = new Types.ObjectId().toString();

  const baseCost = {
    team: teamId,
    model: "claude-opus",
    source: "annotation:per-session",
    inputTokens: 500,
    outputTokens: 100,
    cost: 0.01,
    providerCost: 0.008,
  };

  describe("sumCostByModel", () => {
    it("groups costs by model and sorts by totalCost descending", async () => {
      await LlmCostService.create({
        ...baseCost,
        model: "claude-opus",
        cost: 0.05,
      });
      await LlmCostService.create({
        ...baseCost,
        model: "claude-opus",
        cost: 0.03,
      });
      await LlmCostService.create({
        ...baseCost,
        model: "gemini-flash",
        cost: 0.01,
      });
      await LlmCostService.create({
        ...baseCost,
        team: otherTeamId,
        model: "claude-opus",
        cost: 0.1,
      });

      const result = await LlmCostService.sumCostByModel(teamId);

      expect(result).toHaveLength(2);
      expect(result[0].model).toBe("claude-opus");
      expect(result[0].totalCost).toBeCloseTo(0.08);
      expect(result[1].model).toBe("gemini-flash");
      expect(result[1].totalCost).toBeCloseTo(0.01);
    });

    it("includes token counts", async () => {
      await LlmCostService.create({
        ...baseCost,
        inputTokens: 1000,
        outputTokens: 200,
      });
      await LlmCostService.create({
        ...baseCost,
        inputTokens: 500,
        outputTokens: 100,
      });

      const result = await LlmCostService.sumCostByModel(teamId);

      expect(result[0].totalInputTokens).toBe(1500);
      expect(result[0].totalOutputTokens).toBe(300);
    });

    it("returns empty array when no costs exist", async () => {
      const result = await LlmCostService.sumCostByModel(teamId);
      expect(result).toEqual([]);
    });
  });

  describe("sumCostBySource", () => {
    it("groups costs by source and sorts by totalCost descending", async () => {
      await LlmCostService.create({
        ...baseCost,
        source: "annotation:per-session",
        cost: 0.05,
      });
      await LlmCostService.create({
        ...baseCost,
        source: "annotation:per-session",
        cost: 0.03,
      });
      await LlmCostService.create({
        ...baseCost,
        source: "file-conversion",
        cost: 0.02,
      });
      await LlmCostService.create({
        ...baseCost,
        source: "verification:per-session",
        cost: 0.01,
      });

      const result = await LlmCostService.sumCostBySource(teamId);

      expect(result).toHaveLength(3);
      expect(result[0].source).toBe("annotation:per-session");
      expect(result[0].totalCost).toBeCloseTo(0.08);
      expect(result[1].source).toBe("file-conversion");
      expect(result[1].totalCost).toBeCloseTo(0.02);
      expect(result[2].source).toBe("verification:per-session");
      expect(result[2].totalCost).toBeCloseTo(0.01);
    });

    it("returns empty array when no costs exist", async () => {
      const result = await LlmCostService.sumCostBySource(teamId);
      expect(result).toEqual([]);
    });
  });

  describe("sumCostOverTime", () => {
    it("groups costs by day", async () => {
      const today = new Date();

      await LlmCostService.create({ ...baseCost, cost: 0.05 });
      await LlmCostService.create({ ...baseCost, cost: 0.03 });

      const result = await LlmCostService.sumCostOverTime(teamId, "day");

      expect(result.length).toBeGreaterThanOrEqual(1);
      const todayPeriod = today.toISOString().slice(0, 10);
      const todayEntry = result.find((r) => r.period === todayPeriod);
      expect(todayEntry).toBeDefined();
      expect(todayEntry!.totalCost).toBeCloseTo(0.08);
    });

    it("groups costs by month", async () => {
      await LlmCostService.create({ ...baseCost, cost: 0.05 });
      await LlmCostService.create({ ...baseCost, cost: 0.03 });

      const result = await LlmCostService.sumCostOverTime(teamId, "month");

      expect(result.length).toBeGreaterThanOrEqual(1);
      const now = new Date();
      const monthPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthEntry = result.find((r) => r.period === monthPeriod);
      expect(monthEntry).toBeDefined();
      expect(monthEntry!.totalCost).toBeCloseTo(0.08);
    });

    it("groups costs by week", async () => {
      await LlmCostService.create({ ...baseCost, cost: 0.05 });
      await LlmCostService.create({ ...baseCost, cost: 0.03 });

      const result = await LlmCostService.sumCostOverTime(teamId, "week");

      expect(result.length).toBeGreaterThanOrEqual(1);
      const total = result.reduce((sum, r) => sum + r.totalCost, 0);
      expect(total).toBeCloseTo(0.08);
    });

    it("excludes other teams", async () => {
      await LlmCostService.create({ ...baseCost, cost: 0.05 });
      await LlmCostService.create({
        ...baseCost,
        team: otherTeamId,
        cost: 0.1,
      });

      const result = await LlmCostService.sumCostOverTime(teamId, "day");
      const total = result.reduce((sum, r) => sum + r.totalCost, 0);
      expect(total).toBeCloseTo(0.05);
    });

    it("returns empty array when no costs exist", async () => {
      const result = await LlmCostService.sumCostOverTime(teamId, "day");
      expect(result).toEqual([]);
    });
  });
});
