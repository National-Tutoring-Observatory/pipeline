import { describe, expect, it } from "vitest";
import buildAnnotationTemplateRows from "../helpers/buildAnnotationTemplateRows";

const COLUMNS = [
  "session_id",
  "sequence_id",
  "role",
  "content",
  "annotator[joe]TUTOR_MOVE[0]value",
  "annotator[joe]TUTOR_MOVE[0]reasoning",
];

describe("buildAnnotationTemplateRows", () => {
  it("creates rows from a single session transcript", () => {
    const rows = buildAnnotationTemplateRows(
      [
        {
          sessionName: "session_001.json",
          transcript: [
            { sequence_id: "1", role: "Tutor", content: "Hello!" },
            { sequence_id: "2", role: "Student", content: "Hi!" },
          ],
        },
      ],
      COLUMNS,
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      session_id: "session_001.json",
      sequence_id: "1",
      role: "Tutor",
      content: "Hello!",
      "annotator[joe]TUTOR_MOVE[0]value": "",
      "annotator[joe]TUTOR_MOVE[0]reasoning": "",
    });
    expect(rows[1].role).toBe("Student");
  });

  it("creates rows from multiple sessions in order", () => {
    const rows = buildAnnotationTemplateRows(
      [
        {
          sessionName: "session_001.json",
          transcript: [{ sequence_id: "1", role: "Tutor", content: "Hello!" }],
        },
        {
          sessionName: "session_002.json",
          transcript: [{ sequence_id: "1", role: "Student", content: "Hey!" }],
        },
      ],
      COLUMNS,
    );

    expect(rows).toHaveLength(2);
    expect(rows[0].session_id).toBe("session_001.json");
    expect(rows[1].session_id).toBe("session_002.json");
  });

  it("defaults sequence_id to 1-based index when missing", () => {
    const rows = buildAnnotationTemplateRows(
      [
        {
          sessionName: "session_001.json",
          transcript: [
            { role: "Tutor", content: "First" },
            { role: "Student", content: "Second" },
          ],
        },
      ],
      COLUMNS,
    );

    expect(rows[0].sequence_id).toBe("1");
    expect(rows[1].sequence_id).toBe("2");
  });

  it("sets all annotation columns to empty strings", () => {
    const rows = buildAnnotationTemplateRows(
      [
        {
          sessionName: "session_001.json",
          transcript: [{ sequence_id: "1", role: "Tutor", content: "Hello!" }],
        },
      ],
      COLUMNS,
    );

    expect(rows[0]["annotator[joe]TUTOR_MOVE[0]value"]).toBe("");
    expect(rows[0]["annotator[joe]TUTOR_MOVE[0]reasoning"]).toBe("");
  });

  it("returns empty array for no sessions", () => {
    const rows = buildAnnotationTemplateRows([], COLUMNS);
    expect(rows).toEqual([]);
  });
});
