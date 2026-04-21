import dayjs from "dayjs";
import { describe, expect, it, vi } from "vitest";
import getTeamInviteStatus from "../helpers/getTeamInviteStatus";
import type { TeamInvite } from "../teamInvites.types";

const baseInvite: TeamInvite = {
  _id: "1",
  team: "t1",
  name: "Test",
  slug: "test-abcd1234",
  role: "MEMBER",
  maxUses: 10,
  usedCount: 0,
  createdAt: new Date().toISOString(),
  createdBy: "u1",
};

describe("getTeamInviteStatus", () => {
  it("returns 'active' for a fresh, under-capacity, un-revoked invite", () => {
    expect(getTeamInviteStatus(baseInvite)).toBe("active");
  });

  it("returns 'revoked' when revokedAt is set (takes precedence)", () => {
    expect(
      getTeamInviteStatus({
        ...baseInvite,
        revokedAt: new Date().toISOString(),
        usedCount: 999,
      }),
    ).toBe("revoked");
  });

  it("returns 'full' when usedCount >= maxUses", () => {
    expect(
      getTeamInviteStatus({ ...baseInvite, usedCount: 10, maxUses: 10 }),
    ).toBe("full");
  });

  it("returns 'expired' when older than INVITE_LINK_TTL_DAYS", () => {
    expect(
      getTeamInviteStatus({
        ...baseInvite,
        createdAt: dayjs().subtract(8, "day").toISOString(),
      }),
    ).toBe("expired");
  });

  it("returns 'active' at exactly TTL_DAYS old (deterministic boundary)", () => {
    const now = new Date("2026-01-15T12:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    try {
      expect(
        getTeamInviteStatus({
          ...baseInvite,
          createdAt: dayjs(now).subtract(7, "day").toISOString(),
        }),
      ).toBe("active");
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns 'active' at TTL boundary (just inside)", () => {
    expect(
      getTeamInviteStatus({
        ...baseInvite,
        createdAt: dayjs().subtract(6, "day").toISOString(),
      }),
    ).toBe("active");
  });
});
