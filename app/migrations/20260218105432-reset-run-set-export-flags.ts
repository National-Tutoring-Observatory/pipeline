import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260218105432-reset-run-set-export-flags",
  name: "Reset Run Set Export Flags",
  description:
    "Reset export flags on all run sets so users re-export to the new storage path (run-sets/ instead of collections/)",

  async up(db: Db): Promise<MigrationResult> {
    const result = await db.collection("collections").updateMany(
      {
        $or: [{ hasExportedCSV: true }, { hasExportedJSONL: true }],
      },
      { $set: { hasExportedCSV: false, hasExportedJSONL: false } },
    );

    console.log(`Reset export flags on ${result.modifiedCount} run sets`);

    return {
      success: true,
      message: `Reset export flags on ${result.modifiedCount} run sets`,
      stats: { migrated: result.modifiedCount, failed: 0 },
    };
  },
} satisfies MigrationFile;
