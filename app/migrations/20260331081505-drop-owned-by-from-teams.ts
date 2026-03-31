import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260331081505-drop-owned-by-from-teams",
  name: "Drop Owned By From Teams",
  description: "Remove the ownedBy field from all team documents",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Dropping ownedBy from teams...");

    const result = await db
      .collection("teams")
      .updateMany({}, { $unset: { ownedBy: "" } });

    console.log(`✓ Updated ${result.modifiedCount} team documents`);

    return {
      success: true,
      message: `Removed ownedBy from ${result.modifiedCount} team documents`,
      stats: { migrated: result.modifiedCount, failed: 0 },
    };
  },
} satisfies MigrationFile;
