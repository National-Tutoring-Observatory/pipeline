import { describe, expect, it } from "vitest";
import type { SessionFile } from "~/modules/sessions/sessions.types";
import extractAnnotationValues from "../helpers/extractAnnotationValues";

const s = (data: object) => data as unknown as SessionFile;

describe("extractAnnotationValues", () => {
  describe("PER_SESSION", () => {
    it("extracts value from session-level annotations", () => {
      const sessionJSON = s({
        transcript: [],
        annotations: [
          {
            _id: "0",
            identifiedBy: "LLM",
            engagement_level: "HIGH",
            quality: "GOOD",
          },
        ],
      });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "engagement_level",
      );

      expect(values).toEqual(["HIGH"]);
    });

    it("finds first annotation with the field when multiple exist", () => {
      const sessionJSON = s({
        transcript: [],
        annotations: [
          { _id: "0", identifiedBy: "LLM", category: "A" },
          { _id: "1", identifiedBy: "LLM", category: "B" },
        ],
      });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "category",
      );

      expect(values).toEqual(["A"]);
    });

    it("skips annotations without the field", () => {
      const sessionJSON = s({
        annotations: [
          { _id: "0", identifiedBy: "LLM", other: "X" },
          { _id: "1", identifiedBy: "LLM", field_a: "Y" },
        ],
      });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "field_a",
      );

      expect(values).toEqual(["Y"]);
    });

    it("returns empty string when no annotations have the field", () => {
      const sessionJSON = s({
        annotations: [{ _id: "0", identifiedBy: "LLM", other: "X" }],
      });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "field_a",
      );

      expect(values).toEqual([""]);
    });

    it("returns empty string when no annotations exist", () => {
      const sessionJSON = s({ transcript: [] });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "field",
      );

      expect(values).toEqual([""]);
    });

    it("coerces numeric values to strings", () => {
      const sessionJSON = s({
        annotations: [{ _id: "0", identifiedBy: "LLM", score: 5 }],
      });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "score",
      );

      expect(values).toEqual(["5"]);
    });
  });

  describe("PER_UTTERANCE", () => {
    it("extracts values from utterance-level annotations", () => {
      const sessionJSON = s({
        transcript: [
          {
            _id: "utt-1",
            annotations: [
              { _id: "utt-1", identifiedBy: "LLM", engagement: "HIGH" },
            ],
          },
          {
            _id: "utt-2",
            annotations: [
              { _id: "utt-2", identifiedBy: "LLM", engagement: "MEDIUM" },
            ],
          },
        ],
      });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_UTTERANCE",
        "engagement",
      );

      expect(values).toEqual(["HIGH", "MEDIUM"]);
    });

    it("returns empty string for utterances with no annotations", () => {
      const sessionJSON = s({
        transcript: [
          {
            _id: "utt-1",
            annotations: [{ _id: "utt-1", identifiedBy: "LLM", field: "A" }],
          },
          { _id: "utt-2", annotations: [] },
          {
            _id: "utt-3",
            annotations: [{ _id: "utt-3", identifiedBy: "LLM", field: "B" }],
          },
        ],
      });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_UTTERANCE",
        "field",
      );

      expect(values).toEqual(["A", "", "B"]);
    });

    it("finds first annotation with the field from multiple annotation objects", () => {
      const sessionJSON = s({
        transcript: [
          {
            _id: "utt-1",
            annotations: [
              { _id: "utt-1", identifiedBy: "HUMAN", field_a: "X" },
              { _id: "utt-1", identifiedBy: "HUMAN", field_b: "Y" },
            ],
          },
        ],
      });

      expect(
        extractAnnotationValues(sessionJSON, "PER_UTTERANCE", "field_a"),
      ).toEqual(["X"]);
      expect(
        extractAnnotationValues(sessionJSON, "PER_UTTERANCE", "field_b"),
      ).toEqual(["Y"]);
    });

    it("returns empty array for empty transcript", () => {
      const sessionJSON = s({ transcript: [] });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_UTTERANCE",
        "field",
      );

      expect(values).toEqual([]);
    });

    it("returns empty string for null values in annotations", () => {
      const sessionJSON = s({
        transcript: [
          {
            _id: "utt-1",
            annotations: [
              { _id: "utt-1", identifiedBy: "LLM", field: "A", other: null },
            ],
          },
        ],
      });

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_UTTERANCE",
        "other",
      );

      expect(values).toEqual([""]);
    });
  });
});
