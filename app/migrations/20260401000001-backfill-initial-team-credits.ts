import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

const INITIAL_CREDITS = process.env.BILLING_ENABLED === "true" ? 10 : 75;

export default {
  id: "20260401000001-backfill-initial-team-credits",
  name: "Backfill Initial Team Credits",
  description:
    "Grants $75 initial credits to all existing teams that have no credits yet.",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Backfill Initial Team Credits migration...");

    const superAdmin = await db
      .collection("users")
      .findOne({ role: "SUPER_ADMIN" });

    if (!superAdmin) {
      return {
        success: false,
        message: "No super admin found — cannot set addedBy for credit records",
        stats: { migrated: 0, failed: 0 },
      };
    }

    console.log(
      `Using super admin: ${superAdmin.username} (${superAdmin._id})`,
    );

    const teams = await db
      .collection("teams")
      .find({}, { projection: { _id: 1 } })
      .toArray();

    console.log(`Found ${teams.length} teams`);

    const teamsWithCredits = await db
      .collection("teamcredits")
      .distinct("team");

    const teamsWithCreditsSet = new Set(
      teamsWithCredits.map((id: any) => id.toString()),
    );

    const teamsWithoutCredits = teams.filter(
      (t) => !teamsWithCreditsSet.has(t._id.toString()),
    );

    console.log(`${teamsWithoutCredits.length} teams need initial credits`);

    let migrated = 0;
    let failed = 0;

    for (const team of teamsWithoutCredits) {
      try {
        await db.collection("teamcredits").insertOne({
          team: team._id,
          amount: INITIAL_CREDITS,
          addedBy: superAdmin._id,
          note: "Initial credits",
          createdAt: new Date(),
        });
        console.log(`  ✓ Added $${INITIAL_CREDITS} to team ${team._id}`);
        migrated++;
      } catch (err) {
        console.error(`  ✗ Failed for team ${team._id}:`, err);
        failed++;
      }
    }

    console.log(`\nDone: ${migrated} credited, ${failed} failed`);

    return {
      success: failed === 0,
      message: `Added $${INITIAL_CREDITS} to ${migrated} teams (${failed} failed)`,
      stats: { migrated, failed },
    };
  },
} satisfies MigrationFile;
