import { describe, expect, it } from "vitest";
import type { Utterance } from "../../sessions.types";
import getUtteranceDetails from "../getUtteranceDetails";

const baseUtterance: Utterance = {
  _id: "u1",
  role: "Tutor",
  content: "Hello",
  start_time: "",
  end_time: "",
  timestamp: "",
  annotations: [],
};

describe("getUtteranceDetails", () => {
  it("returns timestamp range and role when start and end times are present", () => {
    const utterance = {
      ...baseUtterance,
      start_time: "0:00",
      end_time: "0:05",
    };
    expect(getUtteranceDetails({ utterance })).toBe("0:00 - 0:05, Tutor");
  });

  it("returns timestamp and role when only timestamp is present", () => {
    const utterance = { ...baseUtterance, timestamp: "0:10" };
    expect(getUtteranceDetails({ utterance })).toBe("0:10, Tutor");
  });

  it("returns start_time and role when only start_time is present", () => {
    const utterance = { ...baseUtterance, start_time: "0:30" };
    expect(getUtteranceDetails({ utterance })).toBe("0:30, Tutor");
  });

  it("returns just role when no time fields are present", () => {
    expect(getUtteranceDetails({ utterance: baseUtterance })).toBe("Tutor");
  });

  it("does not render 'undefined' when role is missing", () => {
    const utterance: Utterance = { ...baseUtterance, role: undefined };
    const result = getUtteranceDetails({ utterance });
    expect(result).not.toContain("undefined");
  });

  it("returns empty string when role is missing and no time fields are present", () => {
    const utterance: Utterance = { ...baseUtterance, role: undefined };
    expect(getUtteranceDetails({ utterance })).toBe("");
  });

  it("returns only the timestamp without trailing comma when role is missing but timestamps are present", () => {
    const utterance: Utterance = {
      ...baseUtterance,
      role: undefined,
      start_time: "0:00",
      end_time: "0:05",
    };
    expect(getUtteranceDetails({ utterance })).toBe("0:00 - 0:05");
  });
});
