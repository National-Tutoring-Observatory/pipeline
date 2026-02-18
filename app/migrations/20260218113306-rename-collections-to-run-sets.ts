import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260218113306-rename-collections-to-run-sets",
  name: "Rename Collections To Run Sets",
  description:
    "Rename MongoDB collection from 'collections' to 'runsets' to match the RunSet model name",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Rename Collections To Run Sets migration...");

    try {
      await db.renameCollection("collections", "runsets");
      console.log("Renamed MongoDB collection: collections → runsets");
    } catch (err: any) {
      if (err.codeName === "NamespaceNotFound") {
        console.log(
          "Collection 'collections' not found — may already be renamed",
        );
        return {
          success: true,
          message: "Collection already renamed",
          stats: { migrated: 0, failed: 0 },
        };
      }
      throw err;
    }

    const count = await db.collection("runsets").countDocuments();
    console.log(`\n✓ Migration complete: ${count} documents in 'runsets'`);

    return {
      success: true,
      message: `Renamed MongoDB collection: collections → runsets (${count} documents)`,
      stats: { migrated: count, failed: 0 },
    };
  },
} satisfies MigrationFile;
