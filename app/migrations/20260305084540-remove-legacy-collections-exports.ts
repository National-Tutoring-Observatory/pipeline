import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

export default {
  id: "20260305084540-remove-legacy-collections-exports",
  name: "Remove Legacy Collections Exports",
  description:
    "Delete old export files at storage/{projectId}/collections/{runSetId}/exports left over from the collections → run-sets rename",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Remove Legacy Collections Exports migration...");

    const storage = getStorageAdapter();

    const runSets = await db
      .collection("runsets")
      .find({}, { projection: { _id: 1, project: 1 } })
      .toArray();

    console.log(`Found ${runSets.length} run sets to check`);

    let removed = 0;
    let failed = 0;

    for (const runSet of runSets) {
      const legacyPath = `storage/${runSet.project}/collections/${runSet._id}/exports`;
      try {
        await storage.removeDir({ sourcePath: legacyPath });
        removed++;
        console.log(`Removed legacy exports: ${legacyPath}`);
      } catch (error) {
        failed++;
        console.log(
          `Failed to remove ${legacyPath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    console.log(`\n✓ Migration complete: ${removed} removed, ${failed} failed`);

    return {
      success: failed === 0,
      message: `Removed legacy exports for ${removed} run sets (${failed} failed)`,
      stats: { migrated: removed, failed },
    };
  },
} satisfies MigrationFile;
