import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { TeamInviteService } from "../teamInvites";

describe("TeamInviteService", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  describe("create", () => {
    it("creates an invite with a generated slug", async () => {
      const invite = await TeamInviteService.create({
        team: "507f1f77bcf86cd799439011",
        name: "Learning Conference Norway",
        maxUses: 20,
        createdBy: "507f1f77bcf86cd799439012",
      });
      expect(invite.slug).toMatch(/^learning-conference-norway-[a-f0-9]{8}$/);
      expect(invite.usedCount).toBe(0);
      expect(invite.role).toBe("MEMBER");
      expect(invite.maxUses).toBe(20);
    });

    it("assigns a unique slug even for duplicate names", async () => {
      const base = {
        team: "507f1f77bcf86cd799439011",
        name: "Same Name",
        maxUses: 5,
        createdBy: "507f1f77bcf86cd799439012",
      };
      const a = await TeamInviteService.create(base);
      const b = await TeamInviteService.create(base);
      expect(a.slug).not.toBe(b.slug);
    });
  });

  describe("findOne", () => {
    it("looks up an invite by slug", async () => {
      const created = await TeamInviteService.create({
        team: "507f1f77bcf86cd799439011",
        name: "Slug Lookup Test",
        maxUses: 5,
        createdBy: "507f1f77bcf86cd799439012",
      });
      const found = await TeamInviteService.findOne({ slug: created.slug });
      expect(found?._id).toBe(created._id);
    });

    it("returns null for an unknown slug", async () => {
      const found = await TeamInviteService.findOne({ slug: "does-not-exist" });
      expect(found).toBeNull();
    });
  });

  describe("revokeById", () => {
    it("sets revokedAt and revokedBy", async () => {
      const invite = await TeamInviteService.create({
        team: "507f1f77bcf86cd799439011",
        name: "Revoke Test",
        maxUses: 5,
        createdBy: "507f1f77bcf86cd799439012",
      });
      const userId = "507f1f77bcf86cd799439099";
      const revoked = await TeamInviteService.revokeById(invite._id, userId);
      expect(revoked?.revokedAt).toBeDefined();
      expect(revoked?.revokedBy).toBe(userId);
    });

    it("returns null for an unknown id", async () => {
      const result = await TeamInviteService.revokeById(
        "507f1f77bcf86cd7994390ff",
        "507f1f77bcf86cd799439099",
      );
      expect(result).toBeNull();
    });
  });

  describe("paginate", () => {
    it("returns data with count and totalPages", async () => {
      for (let i = 0; i < 3; i++) {
        await TeamInviteService.create({
          team: "507f1f77bcf86cd799439011",
          name: `Invite ${i}`,
          maxUses: 5,
          createdBy: "507f1f77bcf86cd799439012",
        });
      }
      const result = await TeamInviteService.paginate({
        match: { team: "507f1f77bcf86cd799439011" },
        page: 1,
        pageSize: 10,
      });
      expect(result.data).toHaveLength(3);
      expect(result.count).toBe(3);
      expect(result.totalPages).toBe(1);
    });
  });
});
