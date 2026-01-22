import { describe, expect, it } from "vitest";
import parseCSV from "../parsers/csvParser";

describe("csvParser", () => {
  it("parses valid CSV with single session", () => {
    const csv = `session_id,role,content,sequence_id
session_001,Tutor,Hello,1
session_001,Student,Hi,2`;

    const result = parseCSV(csv);

    expect(result).toEqual({
      session_001: [
        {
          session_id: "session_001",
          role: "Tutor",
          content: "Hello",
          sequence_id: "1",
        },
        {
          session_id: "session_001",
          role: "Student",
          content: "Hi",
          sequence_id: "2",
        },
      ],
    });
  });

  it("parses CSV with multiple sessions", () => {
    const csv = `session_id,role,content,sequence_id
session_001,Tutor,Hello,1
session_002,Student,Hi,1`;

    const result = parseCSV(csv);

    expect(Object.keys(result)).toHaveLength(2);
    expect(result.session_001).toHaveLength(1);
    expect(result.session_002).toHaveLength(1);
  });

  it("throws error if session_id column is missing", () => {
    const csv = `role,content,sequence_id
Tutor,Hello,1`;

    expect(() => parseCSV(csv)).toThrow('missing required "session_id" column');
  });

  it("throws error if a row is missing session_id", () => {
    const csv = `session_id,role,content,sequence_id
session_001,Tutor,Hello,1
,Student,Hi,2`;

    expect(() => parseCSV(csv)).toThrow('missing required "session_id" column');
  });

  it("handles empty CSV lines gracefully", () => {
    const csv = `session_id,role,content,sequence_id
session_001,Tutor,Hello,1

session_001,Student,Hi,2`;

    const result = parseCSV(csv);

    expect(result.session_001).toHaveLength(2);
  });

  it("handles extra whitespace in values", () => {
    const csv = `session_id,role,content,sequence_id
session_001, Tutor , Hello ,1`;

    const result = parseCSV(csv);

    expect(result.session_001[0].role).toBe(" Tutor ");
  });
});
