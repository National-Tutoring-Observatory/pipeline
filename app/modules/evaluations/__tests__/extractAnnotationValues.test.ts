import { describe, expect, it } from "vitest";
import extractAnnotationValues from "../helpers/extractAnnotationValues";

describe("extractAnnotationValues", () => {
  describe("PER_SESSION", () => {
    it("extracts value from session-level annotations", () => {
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

    it("finds first annotation with the field when multiple exist", () => {
      const sessionJSON = {
        transcript: [],
        annotations: [
          { _id: "0", category: "A" },
          { _id: "1", category: "B" },
        ],
      };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "category",
      );

      expect(values).toEqual(["A"]);
    });

    it("skips annotations without the field", () => {
      const sessionJSON = {
        annotations: [
          { _id: "0", other: "X" },
          { _id: "1", field_a: "Y" },
        ],
      };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "field_a",
      );

      expect(values).toEqual(["Y"]);
    });

    it("returns empty string when no annotations have the field", () => {
      const sessionJSON = {
        annotations: [{ _id: "0", other: "X" }],
      };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "field_a",
      );

      expect(values).toEqual([""]);
    });

    it("returns empty string when no annotations exist", () => {
      const sessionJSON = { transcript: [] };

      const values = extractAnnotationValues(
        sessionJSON,
        "PER_SESSION",
        "field",
      );

      expect(values).toEqual([""]);
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

    it("returns empty string for utterances with no annotations", () => {
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

      expect(values).toEqual(["A", "", "B"]);
    });

    it("finds first annotation with the field from multiple annotation objects", () => {
      const sessionJSON = {
        transcript: [
          {
            _id: "utt-1",
            annotations: [
              { _id: "utt-1", identifiedBy: "HUMAN", field_a: "X" },
              { _id: "utt-1", identifiedBy: "HUMAN", field_b: "Y" },
            ],
          },
        ],
      };

      expect(
        extractAnnotationValues(sessionJSON, "PER_UTTERANCE", "field_a"),
      ).toEqual(["X"]);
      expect(
        extractAnnotationValues(sessionJSON, "PER_UTTERANCE", "field_b"),
      ).toEqual(["Y"]);
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

    it("returns empty string for null values in annotations", () => {
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
