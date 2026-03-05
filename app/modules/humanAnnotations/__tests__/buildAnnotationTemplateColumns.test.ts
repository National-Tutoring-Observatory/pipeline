import { describe, expect, it } from "vitest";
import buildAnnotationTemplateColumns from "../helpers/buildAnnotationTemplateColumns";
import parseAnnotationColumn from "../helpers/parseAnnotationColumns";

describe("buildAnnotationTemplateColumns", () => {
  it("returns context columns when no annotators or fields", () => {
    const columns = buildAnnotationTemplateColumns({
      annotators: [],
      fields: [],
    });
    expect(columns).toEqual(["session_id", "sequence_id", "role", "content"]);
  });

  it("generates value and reasoning columns for a single annotator and field", () => {
    const columns = buildAnnotationTemplateColumns({
      annotators: ["joe"],
      fields: [{ fieldKey: "TUTOR_MOVE", slots: 1 }],
    });
    expect(columns).toEqual([
      "session_id",
      "sequence_id",
      "role",
      "content",
      "annotator[joe]TUTOR_MOVE[0]value",
      "annotator[joe]TUTOR_MOVE[0]reasoning",
    ]);
  });

  it("generates multiple slots per field", () => {
    const columns = buildAnnotationTemplateColumns({
      annotators: ["joe"],
      fields: [{ fieldKey: "TUTOR_MOVE", slots: 2 }],
    });
    expect(columns).toEqual([
      "session_id",
      "sequence_id",
      "role",
      "content",
      "annotator[joe]TUTOR_MOVE[0]value",
      "annotator[joe]TUTOR_MOVE[0]reasoning",
      "annotator[joe]TUTOR_MOVE[1]value",
      "annotator[joe]TUTOR_MOVE[1]reasoning",
    ]);
  });

  it("generates columns for multiple annotators", () => {
    const columns = buildAnnotationTemplateColumns({
      annotators: ["joe", "josephine"],
      fields: [{ fieldKey: "ASKING_FEELING", slots: 1 }],
    });
    expect(columns).toEqual([
      "session_id",
      "sequence_id",
      "role",
      "content",
      "annotator[joe]ASKING_FEELING[0]value",
      "annotator[joe]ASKING_FEELING[0]reasoning",
      "annotator[josephine]ASKING_FEELING[0]value",
      "annotator[josephine]ASKING_FEELING[0]reasoning",
    ]);
  });

  it("generates columns for multiple fields with different slot counts", () => {
    const columns = buildAnnotationTemplateColumns({
      annotators: ["joe"],
      fields: [
        { fieldKey: "TUTOR_MOVE", slots: 2 },
        { fieldKey: "ASKING_FEELING", slots: 1 },
      ],
    });
    expect(columns).toEqual([
      "session_id",
      "sequence_id",
      "role",
      "content",
      "annotator[joe]TUTOR_MOVE[0]value",
      "annotator[joe]TUTOR_MOVE[0]reasoning",
      "annotator[joe]TUTOR_MOVE[1]value",
      "annotator[joe]TUTOR_MOVE[1]reasoning",
      "annotator[joe]ASKING_FEELING[0]value",
      "annotator[joe]ASKING_FEELING[0]reasoning",
    ]);
  });

  it("generates columns parseable by parseAnnotationColumn", () => {
    const columns = buildAnnotationTemplateColumns({
      annotators: ["joe", "josephine"],
      fields: [
        { fieldKey: "TUTOR_MOVE", slots: 2 },
        { fieldKey: "ASKING_FEELING", slots: 1 },
      ],
    });

    const annotationColumns = columns.slice(4);
    for (const col of annotationColumns) {
      const parsed = parseAnnotationColumn(col);
      expect(parsed).not.toBeNull();
      expect(["joe", "josephine"]).toContain(parsed!.annotator);
      expect(["TUTOR_MOVE", "ASKING_FEELING"]).toContain(parsed!.field);
      expect(parsed!.index).toBeTypeOf("number");
      expect(["value", "reasoning"]).toContain(parsed!.subField);
    }
  });
});
