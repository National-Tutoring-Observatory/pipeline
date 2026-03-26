import { describe, expect, it } from "vitest";
import { getSourceLabel, groupCostsBySource } from "../helpers/sourceLabels";

describe("sourceLabels", () => {
  describe("getSourceLabel", () => {
    it("maps annotation sources to Annotation", () => {
      expect(getSourceLabel("annotation:per-session")).toBe("Annotation");
      expect(getSourceLabel("annotation:per-utterance")).toBe("Annotation");
    });

    it("maps verification sources to Verification", () => {
      expect(getSourceLabel("verification:per-session")).toBe("Verification");
      expect(getSourceLabel("verification:per-utterance")).toBe("Verification");
    });

    it("maps other known sources", () => {
      expect(getSourceLabel("file-conversion")).toBe("File Conversion");
      expect(getSourceLabel("codebook-prompt-generation")).toBe(
        "Codebook Generation",
      );
      expect(getSourceLabel("attribute-mapping")).toBe("Attribute Mapping");
      expect(getSourceLabel("prompt-alignment")).toBe("Prompt Alignment");
    });

    it("returns raw string for unknown sources", () => {
      expect(getSourceLabel("unknown-source")).toBe("unknown-source");
    });
  });

  describe("groupCostsBySource", () => {
    it("merges annotation variants into one group", () => {
      const costs = [
        { source: "annotation:per-session", totalCost: 0.05 },
        { source: "annotation:per-utterance", totalCost: 0.03 },
      ];

      const result = groupCostsBySource(costs);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("Annotation");
      expect(result[0].totalCost).toBeCloseTo(0.08);
    });

    it("merges verification variants into one group", () => {
      const costs = [
        { source: "verification:per-session", totalCost: 0.02 },
        { source: "verification:per-utterance", totalCost: 0.01 },
      ];

      const result = groupCostsBySource(costs);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("Verification");
      expect(result[0].totalCost).toBeCloseTo(0.03);
    });

    it("sorts by totalCost descending", () => {
      const costs = [
        { source: "file-conversion", totalCost: 0.01 },
        { source: "annotation:per-session", totalCost: 0.05 },
        { source: "verification:per-session", totalCost: 0.03 },
      ];

      const result = groupCostsBySource(costs);

      expect(result[0].label).toBe("Annotation");
      expect(result[1].label).toBe("Verification");
      expect(result[2].label).toBe("File Conversion");
    });

    it("handles unknown sources", () => {
      const costs = [{ source: "new-feature", totalCost: 0.01 }];

      const result = groupCostsBySource(costs);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("new-feature");
    });

    it("returns empty array for empty input", () => {
      expect(groupCostsBySource([])).toEqual([]);
    });
  });
});
