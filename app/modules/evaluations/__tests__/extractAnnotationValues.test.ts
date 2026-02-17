import { describe, expect, it } from "vitest";
import extractAnnotationValues from "../helpers/extractAnnotationValues";

describe("extractAnnotationValues", () => {
  describe("PER_SESSION", () => {
    it("extracts values from session-level annotations", () => {
      const sessionJSON = {
        transcript: [],
        annotations: [{ _id: "0", engagement_level: "HIGH", quality: "GOOD" }],
      };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "engagement_level",
      );

      expect(values).toEqual(["HIGH"]);
    });

    it("extracts multiple annotation values", () => {
      const sessionJSON = {
        transcript: [],
        annotations: [
          { _id: "0", category: "A" },
          { _id: "1", category: "B" },
          { _id: "2", category: "A" },
        ],
      };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "category",
      );

      expect(values).toEqual(["A", "B", "A"]);
    });

    it("preserves empty string for missing values", () => {
      const sessionJSON = {
        annotations: [{ _id: "0", field_a: "X" }, { _id: "1" }],
      };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "field_a",
      );

      expect(values).toEqual(["X", ""]);
    });

    it("returns empty array when no annotations", () => {
      const sessionJSON = { transcript: [] };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "field",
      );

      expect(values).toEqual([]);
    });

    it("coerces numeric values to strings", () => {
      const sessionJSON = {
        annotations: [{ _id: "0", score: 5 }],
      };

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
      const sessionJSON = {
        transcript: [
          {
            _id: "utt-1",
            role: "TEACHER",
            content: "Hello",
            annotations: [{ _id: "utt-1", engagement: "HIGH" }],
          },
          {
            _id: "utt-2",
            role: "STUDENT",
            content: "Hi",
            annotations: [{ _id: "utt-2", engagement: "MEDIUM" }],
          },
        ],
      };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_UTTERANCE",
        "engagement",
      );

      expect(values).toEqual(["HIGH", "MEDIUM"]);
    });

    it("handles utterances with no annotations", () => {
      const sessionJSON = {
        transcript: [
          {
            _id: "utt-1",
            annotations: [{ _id: "utt-1", field: "A" }],
          },
          {
            _id: "utt-2",
          },
          {
            _id: "utt-3",
            annotations: [{ _id: "utt-3", field: "B" }],
          },
        ],
      };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_UTTERANCE",
        "field",
      );

      expect(values).toEqual(["A", "B"]);
    });

    it("returns empty array for empty transcript", () => {
      const sessionJSON = { transcript: [] };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_UTTERANCE",
        "field",
      );

      expect(values).toEqual([]);
    });

    it("preserves empty string for null values", () => {
      const sessionJSON = {
        transcript: [
          {
            _id: "utt-1",
            annotations: [{ _id: "utt-1", field: "A", other: null }],
          },
        ],
      };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_UTTERANCE",
        "other",
      );

      expect(values).toEqual([""]);
    });
  });
});
