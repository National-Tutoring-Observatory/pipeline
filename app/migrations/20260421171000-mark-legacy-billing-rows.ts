import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260421171000-mark-legacy-billing-rows",
  name: "Mark Legacy Billing Rows",
  description:
    "Marks existing team credit and LLM cost rows as legacy for the ledger-first billing redesign.",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Mark Legacy Billing Rows migration...");

    const teamCredits = db.collection("teamcredits");
    const llmCosts = db.collection("llmcosts");

    const [creditResult, costResult] = await Promise.all([
      teamCredits.updateMany(
        { isLegacy: { $ne: true } },
        {
          $set: {
            isLegacy: true,
            legacyNotes: "pre-ledger-redesign",
          },
        },
      ),
      llmCosts.updateMany(
        { isLegacy: { $ne: true } },
        {
          $set: {
            isLegacy: true,
            legacyNotes: "pre-ledger-redesign",
          },
        },
      ),
    ]);

    const migrated = creditResult.modifiedCount + costResult.modifiedCount;

    console.log(
      `Done: marked ${creditResult.modifiedCount} credit row(s) and ${costResult.modifiedCount} cost row(s) as legacy`,
    );

    return {
      success: true,
      message: `Marked ${migrated} billing row(s) as legacy`,
      stats: {
        migrated,
        failed: 0,
        credits: creditResult.modifiedCount,
        costs: costResult.modifiedCount,
      },
    };
  },
} satisfies MigrationFile;
