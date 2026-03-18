import { describe, expect, it } from "vitest";
import buildAnnotationsForUtterance from "../helpers/buildAnnotationsForUtterance";

describe("buildAnnotationsForUtterance", () => {
  it("builds annotation object from a single field", () => {
    const row = { "annotator[joe][0]TUTOR_MOVE": "EXPLAIN" };
    const headers = ["annotator[joe][0]TUTOR_MOVE"];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([
      { _id: "utt-1", identifiedBy: "HUMAN", TUTOR_MOVE: "EXPLAIN" },
    ]);
  });

  it("groups multiple fields into one annotation object per index", () => {
    const row = {
      "annotator[joe][0]TUTOR_MOVE": "EXPLAIN",
      "annotator[joe][0]REASONING": "Teacher is explaining",
    };
    const headers = [
      "annotator[joe][0]TUTOR_MOVE",
      "annotator[joe][0]REASONING",
    ];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([
      {
        _id: "utt-1",
        identifiedBy: "HUMAN",
        TUTOR_MOVE: "EXPLAIN",
        REASONING: "Teacher is explaining",
      },
    ]);
  });

  it("creates separate annotation objects for different indices", () => {
    const row = {
      "annotator[joe][0]TUTOR_MOVE": "EXPLAIN",
      "annotator[joe][0]REASONING": "First reason",
      "annotator[joe][1]TUTOR_MOVE": "QUESTION",
      "annotator[joe][1]REASONING": "Second reason",
    };
    const headers = [
      "annotator[joe][0]TUTOR_MOVE",
      "annotator[joe][0]REASONING",
      "annotator[joe][1]TUTOR_MOVE",
      "annotator[joe][1]REASONING",
    ];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([
      {
        _id: "utt-1",
        identifiedBy: "HUMAN",
        TUTOR_MOVE: "EXPLAIN",
        REASONING: "First reason",
      },
      {
        _id: "utt-1",
        identifiedBy: "HUMAN",
        TUTOR_MOVE: "QUESTION",
        REASONING: "Second reason",
      },
    ]);
  });

  it("preserves '0' as a valid annotation value", () => {
    const row = { "annotator[joe][0]score": "0" };
    const headers = ["annotator[joe][0]score"];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([
      { _id: "utt-1", identifiedBy: "HUMAN", score: "0" },
    ]);
  });

  it("skips empty values", () => {
    const row = { "annotator[joe][0]TUTOR_MOVE": "" };
    const headers = ["annotator[joe][0]TUTOR_MOVE"];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([]);
  });

  it("only includes annotations for the specified annotator", () => {
    const row = {
      "annotator[joe][0]field": "A",
      "annotator[bob][0]field": "B",
    };
    const headers = ["annotator[joe][0]field", "annotator[bob][0]field"];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([
      { _id: "utt-1", identifiedBy: "HUMAN", field: "A" },
    ]);
  });
});
