import { describe, expect, it } from "vitest";
import generateTeamInviteSlug from "../helpers/generateTeamInviteSlug";

describe("generateTeamInviteSlug", () => {
  it("lowercases and hyphenates the name", () => {
    const slug = generateTeamInviteSlug("Learning Conference Norway");
    expect(slug).toMatch(/^learning-conference-norway-[a-f0-9]{8}$/);
  });

  it("strips punctuation and diacritics", () => {
    const slug = generateTeamInviteSlug("NTO: Fall '26 — Kick-off!");
    expect(slug).toMatch(/^nto-fall-26-kick-off-[a-f0-9]{8}$/);
  });

  it("appends an 8-char random hex suffix", () => {
    const slug = generateTeamInviteSlug("Test");
    const suffix = slug.split("-").pop()!;
    expect(suffix).toHaveLength(8);
    expect(suffix).toMatch(/^[a-f0-9]{8}$/);
  });

  it("produces distinct suffixes on repeated calls", () => {
    const a = generateTeamInviteSlug("Test");
    const b = generateTeamInviteSlug("Test");
    expect(a).not.toBe(b);
  });

  it("falls back to 'invite' when the name slugifies to empty", () => {
    const slug = generateTeamInviteSlug("!!! ???");
    expect(slug).toMatch(/^invite-[a-f0-9]{8}$/);
  });
});
