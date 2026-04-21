import { Types } from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { BillingLedgerEntryService } from "../billingLedgerEntry";
import addCredits from "../services/addCredits.server";
import { TeamBillingBalanceService } from "../teamBillingBalance";
import { TeamCreditService } from "../teamCredit";

describe("addCredits", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  const teamId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  it("rejects amounts below $10", async () => {
    const result = await addCredits({
      teamId,
      amount: 5,
      addedBy: userId,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Minimum");
  });

  it("rejects non-number amounts", async () => {
    const result = await addCredits({
      teamId,
      amount: "abc" as any,
      addedBy: userId,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid");
  });

  it("rejects NaN amounts", async () => {
    const result = await addCredits({
      teamId,
      amount: NaN,
      addedBy: userId,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid");
  });

  it("rejects Infinity", async () => {
    const result = await addCredits({
      teamId,
      amount: Infinity,
      addedBy: userId,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid");
  });

  it("rejects non-integer amounts", async () => {
    const result = await addCredits({
      teamId,
      amount: 10.5,
      addedBy: userId,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("whole dollar");
  });

  it("creates credit record for valid amount", async () => {
    const result = await addCredits({
      teamId,
      amount: 50,
      addedBy: userId,
    });

    expect(result.success).toBe(true);

    const credits = await TeamCreditService.findByTeam(teamId);
    expect(credits).toHaveLength(1);
    expect(credits[0].amount).toBe(50);
    expect(credits[0].addedBy).toBe(userId);

    const ledger = await BillingLedgerEntryService.findByTeam(teamId);
    expect(ledger).toHaveLength(1);
    expect(ledger[0].direction).toBe("credit");

    const balance = await TeamBillingBalanceService.findByTeam(teamId);
    expect(balance?.availableBalance).toBe(50);
  });

  it("defaults note to 'Added by System Admin' when not provided", async () => {
    await addCredits({
      teamId,
      amount: 25,
      addedBy: userId,
    });

    const credits = await TeamCreditService.findByTeam(teamId);
    expect(credits[0].note).toBe("Added by System Admin");
  });

  it("stores optional note with credit", async () => {
    const result = await addCredits({
      teamId,
      amount: 25,
      note: "Monthly top-up",
      addedBy: userId,
    });

    expect(result.success).toBe(true);

    const credits = await TeamCreditService.findByTeam(teamId);
    expect(credits[0].note).toBe("Monthly top-up");
  });
});
