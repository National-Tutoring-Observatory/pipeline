import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

const ORPHANED_COLLECTIONS = ["sessions", "runs", "runsets", "evaluations"];

export default {
  id: "20260403172820-delete-orphaned-project-data",
  name: "Delete Orphaned Project Data",
  description:
    "Delete documents from sessions, runs, runsets, and evaluations whose project no longer exists",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Delete Orphaned Project Data migration...");

    const projectIds = await db
      .collection("projects")
      .find({}, { projection: { _id: 1 } })
      .map((p) => p._id)
      .toArray();

    console.log(`Found ${projectIds.length} existing projects`);

    const stats: Record<string, number> = {};

    for (const collection of ORPHANED_COLLECTIONS) {
      const result = await db
        .collection(collection)
        .deleteMany({ project: { $exists: true, $nin: projectIds } });

      stats[collection] = result.deletedCount;
      console.log(
        `  ${collection}: deleted ${result.deletedCount} orphaned documents`,
      );
    }

    const totalDeleted = Object.values(stats).reduce((sum, n) => sum + n, 0);

    console.log(
      `\n✓ Migration complete: ${totalDeleted} orphaned documents deleted`,
    );

    return {
      success: true,
      message: `Deleted ${totalDeleted} orphaned documents`,
      stats,
    };
  },
} satisfies MigrationFile;
