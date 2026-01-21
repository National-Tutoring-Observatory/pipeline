import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260112143157-move-team-field-to-context-for-audit-records",
  name: "Move Team Field To Context For Audit Records",
  description:
    "Move team field from top level to context.team for audit records that lack it",

  async up(db: Db): Promise<MigrationResult> {
    const auditCollection = db.collection("audits");

    console.log(
      "Starting Move Team Field To Context For Audit Records migration...",
    );

    // Move team field to context.team (without aggregation pipeline for DocumentDB compatibility)
    const cursor = auditCollection.find({ team: { $exists: true } });
    let migrated = 0;
    for await (const doc of cursor) {
      await auditCollection.updateOne(
        { _id: doc._id },
        {
          $set: { "context.team": doc.team },
          $unset: { team: "" },
        },
      );
      migrated++;
      if (migrated % 1000 === 0) {
        console.log(`Processed ${migrated} records...`);
      }
    }
    console.log(
      `Moved team to context.team and removed team field: ${migrated}`,
    );

    console.log(`\n✓ Migration complete: ${migrated} migrated`);

    return {
      success: true,
      message: `Moved team field to context.team for ${migrated} audit records`,
      stats: { migrated, failed: 0 },
    };
  },
} satisfies MigrationFile;
