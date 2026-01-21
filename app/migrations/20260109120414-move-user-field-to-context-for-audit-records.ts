import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260109120414-move-user-field-to-context-for-audit-records",
  name: "Move User Field To Context For Audit Records",
  description:
    "Move user field from top level to context.target for audit records",

  async up(db: Db): Promise<MigrationResult> {
    const auditCollection = db.collection("audits");

    console.log(
      "Starting Move User Field To Context For Audit Records migration...",
    );

    // Check total audit records
    const totalAudits = await auditCollection.countDocuments({});
    console.log(`Total audit records: ${totalAudits}`);

    // Check how many have user field
    const withUserField = await auditCollection.countDocuments({
      user: { $exists: true },
    });
    console.log(`Audit records with user field: ${withUserField}`);

    if (withUserField > 0) {
      const sample = await auditCollection.findOne({ user: { $exists: true } });
      console.log(
        `Sample audit record with user field:`,
        JSON.stringify(sample, null, 2),
      );
    }

    // Rename ADD_SUPERADMIN to SUPERADMIN_REQUEST_TEAM_ADMIN for old team admin assignments
    const renamedResult = await auditCollection.updateMany(
      { action: "ADD_SUPERADMIN", team: { $exists: true } },
      { $set: { action: "SUPERADMIN_REQUEST_TEAM_ADMIN" } },
    );
    console.log(
      `Renamed ADD_SUPERADMIN records: ${renamedResult.modifiedCount}`,
    );

    // Move user field to context.target (without aggregation pipeline for older MongoDB versions)
    const cursor = auditCollection.find({ user: { $exists: true } });
    let movedCount = 0;
    for await (const doc of cursor) {
      await auditCollection.updateOne(
        { _id: doc._id },
        {
          $set: { "context.target": doc.user },
          $unset: { user: "" },
        },
      );
      movedCount++;
      if (movedCount % 1000 === 0) {
        console.log(`Processed ${movedCount} records...`);
      }
    }
    console.log(
      `Moved user to context.target and removed user field: ${movedCount}`,
    );

    return {
      success: true,
      message: "Migration completed successfully",
      stats: { migrated: renamedResult.modifiedCount + movedCount, failed: 0 },
    };
  },
} satisfies MigrationFile;
