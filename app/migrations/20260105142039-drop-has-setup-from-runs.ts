import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260105142039-drop-has-setup-from-runs",
  name: "Drop Has Setup From Runs",
  description: "Drop hasSetup From Runs",

  async up(db: Db): Promise<MigrationResult> {
    const runs = db.collection("runs");

    const result = await runs.updateMany({}, { $unset: { hasSetup: 1 } });

    return {
      success: true,
      message: "Migration completed successfully",
      stats: { migrated: result.modifiedCount, failed: 0 },
    };
  },
} satisfies MigrationFile;
