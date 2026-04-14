import { describe, expect, it } from "vitest";
import mapFileToTranscript from "../mapFileToTranscript";

const standardMapping = {
  role: "role",
  content: "content",
  session_id: "session_id",
  sequence_id: "sequence_id",
};

describe("mapFileToTranscript", () => {
  it("maps standard field names correctly", () => {
    const jsonFile = [
      { role: "Tutor", content: "Hello", session_id: "s1", sequence_id: 1 },
      { role: "Student", content: "Hi", session_id: "s1", sequence_id: 2 },
    ];

    const result = mapFileToTranscript(jsonFile, standardMapping);

    expect(result[0].role).toBe("Tutor");
    expect(result[0].content).toBe("Hello");
    expect(result[1].role).toBe("Student");
    expect(result[1].content).toBe("Hi");
  });

  it("uses attributesMapping to read alternative field names", () => {
    const jsonFile = [
      { speaker: "Tutor", text: "Hello", sid: "s1", seq: 1 },
      { speaker: "Student", text: "Hi", sid: "s1", seq: 2 },
    ];
    const mapping = {
      role: "speaker",
      content: "text",
      session_id: "sid",
      sequence_id: "seq",
    };

    const result = mapFileToTranscript(jsonFile, mapping);

    expect(result[0].role).toBe("Tutor");
    expect(result[0].content).toBe("Hello");
    expect(result[0].session_id).toBe("s1");
    expect(result[0].sequence_id).toBe(1);
    expect(result[1].role).toBe("Student");
    expect(result[1].content).toBe("Hi");
  });

  it("assigns sequential _id from index", () => {
    const jsonFile = [
      { role: "Tutor", content: "Hello" },
      { role: "Student", content: "Hi" },
    ];

    const result = mapFileToTranscript(jsonFile, standardMapping);

    expect(result[0]._id).toBe("0");
    expect(result[1]._id).toBe("1");
  });

  it("maps optional time and session fields", () => {
    const jsonFile = [
      {
        role: "Tutor",
        content: "Hi",
        start_time: "0:00",
        end_time: "0:05",
        timestamp: "0:00",
        session_id: "s1",
        sequence_id: 1,
      },
    ];

    const result = mapFileToTranscript(jsonFile, standardMapping);

    expect(result[0].start_time).toBe("0:00");
    expect(result[0].end_time).toBe("0:05");
    expect(result[0].timestamp).toBe("0:00");
    expect(result[0].session_id).toBe("s1");
    expect(result[0].sequence_id).toBe(1);
  });

  it("initialises annotations as empty array", () => {
    const jsonFile = [{ role: "Tutor", content: "Hi" }];

    const result = mapFileToTranscript(jsonFile, standardMapping);

    expect(result[0].annotations).toEqual([]);
  });
});
