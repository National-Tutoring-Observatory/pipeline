import { describe, expect, it } from "vitest";
import sanitizeReturnTo from "../helpers/sanitizeReturnTo";

describe("sanitizeReturnTo", () => {
  it("returns valid paths as-is", () => {
    expect(sanitizeReturnTo("/projects/123")).toBe("/projects/123");
    expect(sanitizeReturnTo("/")).toBe("/");
  });

  it("allows paths with query strings", () => {
    // Safe now that returnTo lives in the session — not exposed in public URLs
    expect(sanitizeReturnTo("/projects/123?foo=bar")).toBe(
      "/projects/123?foo=bar",
    );
    expect(sanitizeReturnTo("/projects/123?searchValue=hello&page=2")).toBe(
      "/projects/123?searchValue=hello&page=2",
    );
  });

  it("returns / for non-string values", () => {
    expect(sanitizeReturnTo(null)).toBe("/");
    expect(sanitizeReturnTo(undefined)).toBe("/");
    expect(sanitizeReturnTo(42)).toBe("/");
    expect(sanitizeReturnTo({})).toBe("/");
  });

  it("returns / for empty string", () => {
    expect(sanitizeReturnTo("")).toBe("/");
  });

  it("blocks protocol-relative URLs (//evil.com)", () => {
    expect(sanitizeReturnTo("//evil.com")).toBe("/");
    expect(sanitizeReturnTo("//evil.com/path")).toBe("/");
  });

  it("blocks absolute URLs", () => {
    expect(sanitizeReturnTo("https://evil.com")).toBe("/");
    expect(sanitizeReturnTo("http://evil.com/path")).toBe("/");
  });

  it("blocks values not starting with /", () => {
    expect(sanitizeReturnTo("evil.com")).toBe("/");
    expect(sanitizeReturnTo("relative/path")).toBe("/");
  });

  describe("open redirect bypass attempts", () => {
    it("blocks backslash bypass (/\\evil.com)", () => {
      // Browsers normalize /\ to // in Location headers
      expect(sanitizeReturnTo("/\\evil.com")).toBe("/");
    });

    it("blocks unicode fullwidth slash (／/evil.com)", () => {
      // U+FF0F looks like / but is a different character — does not start with /
      expect(sanitizeReturnTo("\uFF0F\uFF0Fevil.com")).toBe("/");
    });

    it("blocks javascript: scheme", () => {
      expect(sanitizeReturnTo("javascript:alert(1)")).toBe("/");
    });

    it("blocks data: scheme", () => {
      expect(sanitizeReturnTo("data:text/html,<script>alert(1)</script>")).toBe(
        "/",
      );
    });

    it("allows a valid path that contains a colon", () => {
      // Colons are valid in path segments (e.g. timestamps), not a bypass
      expect(sanitizeReturnTo("/projects/123:detail")).toBe(
        "/projects/123:detail",
      );
    });
  });
});
