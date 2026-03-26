import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260326120000-assign-default-plan-to-existing-teams",
  name: "Assign Default Plan To Existing Teams",
  description:
    "Assigns the default billing plan to all teams that don't already have a plan assigned",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Assign Default Plan To Existing Teams migration...");

    const billingPlans = db.collection("billingplans");
    const teams = db.collection("teams");
    const teamBillingPlans = db.collection("teambillingplans");

    const defaultPlan = await billingPlans.findOne({ isDefault: true });
    if (!defaultPlan) {
      console.log("No default billing plan found, aborting...");
      return {
        success: false,
        message: "No default billing plan found",
        stats: { migrated: 0, failed: 0 },
      };
    }

    console.log(`Found default plan: ${defaultPlan.name} (${defaultPlan._id})`);

    const allTeams = await teams.find({}, { projection: { _id: 1 } }).toArray();
    console.log(`Found ${allTeams.length} total teams`);

    const assignedTeams = await teamBillingPlans
      .find({}, { projection: { team: 1 } })
      .toArray();
    const assignedTeamIds = new Set(
      assignedTeams.map((r) => r.team.toString()),
    );

    const unassignedTeams = allTeams.filter(
      (t) => !assignedTeamIds.has(t._id.toString()),
    );
    console.log(`Found ${unassignedTeams.length} teams without a plan`);

    let migrated = 0;
    let failed = 0;

    for (const team of unassignedTeams) {
      try {
        await teamBillingPlans.insertOne({
          team: team._id,
          plan: defaultPlan._id,
          createdAt: new Date(),
        });
        console.log(`  ✓ Assigned plan to team ${team._id}`);
        migrated++;
      } catch (err) {
        console.error(`  ✗ Failed to assign plan to team ${team._id}:`, err);
        failed++;
      }
    }

    console.log(`\nDone: ${migrated} assigned, ${failed} failed`);

    return {
      success: failed === 0,
      message: `Assigned default plan to ${migrated} teams (${failed} failed)`,
      stats: { migrated, failed },
    };
  },
} satisfies MigrationFile;
