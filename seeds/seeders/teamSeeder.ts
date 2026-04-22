import { TeamBillingService } from "../../app/modules/billing/teamBilling.js";
import { TeamService } from "../../app/modules/teams/team.js";
import { UserService } from "../../app/modules/users/user.js";
import { getSeededUsers } from "./userSeeder.js";

const SEED_CREDITS = 1000;

const SEED_TEAMS = [
  {
    name: "Research Team Alpha",
  },
  {
    name: "Education Lab Beta",
  },
];

async function ensureSeedBillingCredits(teamId: string, adminId: string) {
  await TeamBillingService.setupTeamBilling(teamId);
  await TeamBillingService.addCredits({
    teamId,
    amount: SEED_CREDITS,
    addedBy: adminId,
    note: "Seed credits",
    idempotencyKey: `seed-credit:${teamId}`,
  });
}

export async function seedTeams() {
  const users = await getSeededUsers();

  if (users.length === 0) {
    console.warn("  ⚠️  No seeded users found. Please run user seeder first.");
    return;
  }

  const admin = users.find((u) => u.role === "SUPER_ADMIN");
  if (!admin) {
    console.warn("  ⚠️  No admin user found.");
    return;
  }

  const localUsers = await UserService.find({ match: { username: "local" } });
  const localUser = localUsers[0] || null;

  if (localUser) {
    console.log(`  ℹ️  Found 'local' user, will add to Research Team Alpha`);
  }

  const existingPersonal = await TeamService.find({
    match: { isPersonal: true, createdBy: admin._id },
  });

  if (existingPersonal.length > 0) {
    await ensureSeedBillingCredits(existingPersonal[0]._id, admin._id);
    console.log(
      `  ⏭️  Personal workspace for '${admin.username}' already exists, ensured billing and seed credits...`,
    );
  } else {
    const personalTeam = await TeamService.createForUser(
      `${admin.name}'s Workspace`,
      admin._id,
      { isPersonal: true },
    );
    await ensureSeedBillingCredits(personalTeam._id, admin._id);
    console.log(
      `  ✓ Created personal workspace: ${personalTeam.name} (ID: ${personalTeam._id})`,
    );
  }

  for (const teamData of SEED_TEAMS) {
    try {
      // Check if team already exists
      const existing = await TeamService.find({
        match: { name: teamData.name },
      });

      if (existing.length > 0) {
        await ensureSeedBillingCredits(existing[0]._id, admin._id);
        console.log(
          `  ⏭️  Team '${teamData.name}' already exists, ensured billing and seed credits...`,
        );
        continue;
      }

      const result = await TeamService.create(teamData);
      console.log(`  ✓ Created team: ${teamData.name} (ID: ${result._id})`);

      await ensureSeedBillingCredits(result._id, admin._id);
      console.log(`  ✓ Assigned billing plan and $${SEED_CREDITS} credits`);
    } catch (error) {
      console.error(`  ✗ Error creating team ${teamData.name}:`, error);
      throw error;
    }
  }

  const teams = await TeamService.find({
    match: { name: "Research Team Alpha" },
  });
  const team = teams[0];

  if (team) {
    await UserService.addTeam(admin._id, team._id, "ADMIN");
  }
}

export async function getSeededTeams() {
  return await TeamService.find({
    match: { name: { $in: SEED_TEAMS.map((t) => t.name) } },
  });
}
