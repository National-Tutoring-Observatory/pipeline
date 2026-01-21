import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260105140929-remove-incomplete-runs",
  name: "Remove Incomplete Runs",
  description: "Remove Incomplete Runs",

  async up(db: Db): Promise<MigrationResult> {
    const runs = db.collection("runs");

    const result = await runs.deleteMany({ hasSetup: false });

    return {
      success: true,
      message: "Migration completed successfully",
      stats: { migrated: result.deletedCount, failed: 0 },
    };
  },
} satisfies MigrationFile;
