import { describe, expect, it } from "vitest";
import buildAnnotationsForUtterance from "../helpers/buildAnnotationsForUtterance";

describe("buildAnnotationsForUtterance", () => {
  it("builds annotation object from a single field", () => {
    const row = { "annotator[joe]TUTOR_MOVE[0]value": "EXPLAIN" };
    const headers = ["annotator[joe]TUTOR_MOVE[0]value"];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([
      { _id: "utt-1", identifiedBy: "HUMAN", TUTOR_MOVE: "EXPLAIN" },
    ]);
  });

  it("includes reasoning when provided", () => {
    const row = {
      "annotator[joe]TUTOR_MOVE[0]value": "EXPLAIN",
      "annotator[joe]TUTOR_MOVE[0]reasoning": "Teacher is explaining",
    };
    const headers = [
      "annotator[joe]TUTOR_MOVE[0]value",
      "annotator[joe]TUTOR_MOVE[0]reasoning",
    ];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([
      {
        _id: "utt-1",
        identifiedBy: "HUMAN",
        TUTOR_MOVE: "EXPLAIN",
        reasoning: "Teacher is explaining",
      },
    ]);
  });

  it("preserves '0' as a valid annotation value", () => {
    const row = { "annotator[joe]score[0]value": "0" };
    const headers = ["annotator[joe]score[0]value"];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([
      { _id: "utt-1", identifiedBy: "HUMAN", score: "0" },
    ]);
  });

  it("skips empty values", () => {
    const row = { "annotator[joe]TUTOR_MOVE[0]value": "" };
    const headers = ["annotator[joe]TUTOR_MOVE[0]value"];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([]);
  });

  it("only includes annotations for the specified annotator", () => {
    const row = {
      "annotator[joe]field[0]value": "A",
      "annotator[bob]field[0]value": "B",
    };
    const headers = [
      "annotator[joe]field[0]value",
      "annotator[bob]field[0]value",
    ];

    const result = buildAnnotationsForUtterance(row, "utt-1", "joe", headers);

    expect(result).toEqual([
      { _id: "utt-1", identifiedBy: "HUMAN", field: "A" },
    ]);
  });
});
