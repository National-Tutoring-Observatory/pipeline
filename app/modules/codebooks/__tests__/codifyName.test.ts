import { describe, expect, it } from "vitest";
import codifyName from "../helpers/codifyName";

describe("codifyName", () => {
  it("converts a single word to uppercase", () => {
    expect(codifyName("Engagement")).toBe("ENGAGEMENT");
  });

  it("converts multi-word names to SCREAMING_SNAKE_CASE", () => {
    expect(codifyName("Praise Given")).toBe("PRAISE_GIVEN");
  });

  it("handles extra spaces between words", () => {
    expect(codifyName("Some   Extra   Spaces")).toBe("SOME_EXTRA_SPACES");
  });

  it("strips non-alphanumeric characters", () => {
    expect(codifyName("Has-Special/Chars!")).toBe("HASSPECIALCHARS");
  });

  it("handles leading and trailing whitespace", () => {
    expect(codifyName("  Trimmed  ")).toBe("TRIMMED");
  });

  it("returns empty string for empty input", () => {
    expect(codifyName("")).toBe("");
  });

  it("handles lowercase input", () => {
    expect(codifyName("already lowercase")).toBe("ALREADY_LOWERCASE");
  });
});
