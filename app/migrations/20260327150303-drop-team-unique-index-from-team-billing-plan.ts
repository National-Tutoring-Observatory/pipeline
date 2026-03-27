import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260327150303-drop-team-unique-index-from-team-billing-plan",
  name: "Drop Team Unique Index From TeamBillingPlan",
  description:
    "Drops the legacy single-field unique index on 'team' from teambillingplans, replaced by compound unique index on { team, effectiveFrom }",

  async up(db: Db): Promise<MigrationResult> {
    const collection = db.collection("teambillingplans");

    const indexes = await collection.indexes();
    console.log(
      `Found ${indexes.length} indexes on teambillingplans:`,
      indexes.map((i) => i.name),
    );

    const legacyIndex = indexes.find(
      (i) =>
        i.name === "team_1" &&
        i.unique === true &&
        !("effectiveFrom" in (i.key ?? {})),
    );

    if (!legacyIndex) {
      console.log("Legacy team_1 unique index not found — skipping");
      return {
        success: true,
        message: "No legacy index to drop",
        stats: { migrated: 0, failed: 0 },
      };
    }

    await collection.dropIndex("team_1");
    console.log("Dropped legacy team_1 unique index from teambillingplans");

    return {
      success: true,
      message: "Dropped legacy team_1 unique index",
      stats: { migrated: 1, failed: 0 },
    };
  },
} satisfies MigrationFile;
