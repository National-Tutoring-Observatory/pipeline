import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { TeamService } from "../../teams/team";
import { UserService } from "../../users/user";
import {
  activeTeamsToCSV,
  paginateActiveTeams,
} from "../services/getActiveTeams.server";
import { TeamBillingBalanceService } from "../teamBillingBalance";

describe("getActiveTeams", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  async function seedTeamWithSpend(options: {
    teamName: string;
    contactName: string;
    email: string;
    institution?: string;
    totalBilledCosts: number;
  }) {
    const user = await UserService.create({
      username: options.contactName,
      name: options.contactName,
      email: options.email,
      institution: options.institution,
      role: "USER",
    });

    const team = await TeamService.create({
      name: options.teamName,
      billingUser: user._id,
    });

    await TeamBillingBalanceService.ensureInitialized(team._id);
    await TeamBillingBalanceService.reconcileToSnapshot({
      teamId: team._id,
      expectedBalance: 100 - options.totalBilledCosts,
      lastLedgerEntryAt: new Date(),
      currentVersion: 0,
      runningTotals: {
        totalCredits: 100,
        totalBilledCosts: options.totalBilledCosts,
        totalRawCosts: options.totalBilledCosts * 0.8,
      },
    });

    return { user, team };
  }

  describe("paginateActiveTeams", () => {
    it("returns teams with spend sorted by totalBilledCosts descending", async () => {
      await seedTeamWithSpend({
        teamName: "Low Spender",
        contactName: "alice",
        email: "alice@test.com",
        totalBilledCosts: 3,
      });
      await seedTeamWithSpend({
        teamName: "High Spender",
        contactName: "bob",
        email: "bob@test.com",
        totalBilledCosts: 15,
      });

      const result = await paginateActiveTeams({
        match: {},
        sort: "-totalBilledCosts",
        page: 1,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].teamName).toBe("High Spender");
      expect(result.data[0].totalBilledCosts).toBe(15);
      expect(result.data[1].teamName).toBe("Low Spender");
      expect(result.data[1].totalBilledCosts).toBe(3);
    });

    it("excludes teams with zero spend", async () => {
      await seedTeamWithSpend({
        teamName: "Active",
        contactName: "active",
        email: "active@test.com",
        totalBilledCosts: 7,
      });

      const zeroTeam = await TeamService.create({ name: "Zero Spend" });
      await TeamBillingBalanceService.ensureInitialized(zeroTeam._id);

      const result = await paginateActiveTeams({
        match: {},
        sort: "-totalBilledCosts",
        page: 1,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].teamName).toBe("Active");
    });

    it("filters by minimum spend threshold", async () => {
      await seedTeamWithSpend({
        teamName: "Under 5",
        contactName: "low",
        email: "low@test.com",
        totalBilledCosts: 3,
      });
      await seedTeamWithSpend({
        teamName: "Over 5",
        contactName: "mid",
        email: "mid@test.com",
        totalBilledCosts: 8,
      });
      await seedTeamWithSpend({
        teamName: "Over 10",
        contactName: "high",
        email: "high@test.com",
        totalBilledCosts: 12,
      });

      const over5 = await paginateActiveTeams({
        match: { totalBilledCosts: { $gt: 5 } },
        sort: "-totalBilledCosts",
        page: 1,
      });

      expect(over5.data).toHaveLength(2);
      expect(over5.data[0].teamName).toBe("Over 10");
      expect(over5.data[1].teamName).toBe("Over 5");

      const over10 = await paginateActiveTeams({
        match: { totalBilledCosts: { $gt: 10 } },
        sort: "-totalBilledCosts",
        page: 1,
      });

      expect(over10.data).toHaveLength(1);
      expect(over10.data[0].teamName).toBe("Over 10");
    });

    it("resolves billingUser as the contact", async () => {
      await seedTeamWithSpend({
        teamName: "Test Team",
        contactName: "owner",
        email: "owner@university.edu",
        institution: "State University",
        totalBilledCosts: 6,
      });

      const result = await paginateActiveTeams({
        match: {},
        sort: "-totalBilledCosts",
        page: 1,
      });

      expect(result.data[0].teamName).toBe("Test Team");
      expect(result.data[0].contactName).toBe("owner");
      expect(result.data[0].contactEmail).toBe("owner@university.edu");
      expect(result.data[0].institution).toBe("State University");
    });

    it("falls back to createdBy when billingUser is not set", async () => {
      const creator = await UserService.create({
        username: "creator",
        name: "Creator",
        email: "creator@test.com",
        role: "USER",
      });

      const team = await TeamService.create({
        name: "No Billing User",
        createdBy: creator._id,
      });

      await TeamBillingBalanceService.ensureInitialized(team._id);
      await TeamBillingBalanceService.reconcileToSnapshot({
        teamId: team._id,
        expectedBalance: 90,
        lastLedgerEntryAt: new Date(),
        currentVersion: 0,
        runningTotals: {
          totalCredits: 100,
          totalBilledCosts: 10,
          totalRawCosts: 8,
        },
      });

      const result = await paginateActiveTeams({
        match: {},
        sort: "-totalBilledCosts",
        page: 1,
      });

      expect(result.data[0].contactName).toBe("Creator");
      expect(result.data[0].contactEmail).toBe("creator@test.com");
    });

    it("paginates results", async () => {
      for (let i = 1; i <= 25; i++) {
        await seedTeamWithSpend({
          teamName: `Team ${i}`,
          contactName: `user${i}`,
          email: `user${i}@test.com`,
          totalBilledCosts: i,
        });
      }

      const page1 = await paginateActiveTeams({
        match: {},
        sort: "-totalBilledCosts",
        page: 1,
      });

      expect(page1.data).toHaveLength(20);
      expect(page1.totalPages).toBe(2);
      expect(page1.data[0].totalBilledCosts).toBe(25);

      const page2 = await paginateActiveTeams({
        match: {},
        sort: "-totalBilledCosts",
        page: 2,
      });

      expect(page2.data).toHaveLength(5);
      expect(page2.data[0].totalBilledCosts).toBe(5);
    });
  });

  describe("activeTeamsToCSV", () => {
    it("produces valid CSV with headers", () => {
      const csv = activeTeamsToCSV([
        {
          teamId: "t1",
          teamName: "Team One",
          contactName: "Alice",
          contactEmail: "alice@test.com",
          institution: "MIT",
          totalBilledCosts: 12.5,
        },
      ]);

      const lines = csv.split("\n");
      expect(lines[0]).toBe("Team,Contact,Email,Institution,Total Spend");
      expect(lines[1]).toBe("Team One,Alice,alice@test.com,MIT,$12.50");
    });

    it("sanitizes formula injection characters", () => {
      const csv = activeTeamsToCSV([
        {
          teamId: "t1",
          teamName: "=EVIL",
          contactName: "+cmd",
          contactEmail: "-test@test.com",
          institution: "@inject",
          totalBilledCosts: 5,
        },
      ]);

      const lines = csv.split("\n");
      expect(lines[1]).toContain("\t=EVIL");
      expect(lines[1]).toContain("\t+cmd");
      expect(lines[1]).toContain("\t-test@test.com");
      expect(lines[1]).toContain("\t@inject");
    });

    it("escapes fields with commas", () => {
      const csv = activeTeamsToCSV([
        {
          teamId: "t1",
          teamName: "Team, Inc.",
          contactName: "Bob",
          contactEmail: "bob@test.com",
          institution: "--",
          totalBilledCosts: 5,
        },
      ]);

      const lines = csv.split("\n");
      expect(lines[1]).toContain('"Team, Inc."');
    });
  });
});
