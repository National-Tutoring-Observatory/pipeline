import { TeamService } from "../../app/modules/teams/team.js";
import { UserService } from "../../app/modules/users/user.js";
import type { User } from "../../app/modules/users/users.types.js";
import { getSeededUsers } from "./userSeeder.js";

const SEED_TEAMS = [
  {
    name: "Research Team Alpha",
  },
  {
    name: "Education Lab Beta",
  },
];

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

  for (const teamData of SEED_TEAMS) {
    try {
      // Check if team already exists
      const existing = await TeamService.find({
        match: { name: teamData.name },
      });

      if (existing.length > 0) {
        console.log(
          `  ⏭️  Team '${teamData.name}' already exists, skipping...`,
        );
        continue;
      }

      const result = await TeamService.create(teamData);
      console.log(`  ✓ Created team: ${teamData.name} (ID: ${result._id})`);
    } catch (error) {
      console.error(`  ✗ Error creating team ${teamData.name}:`, error);
      throw error;
    }
  }

  // Add "local" user to Research Team Alpha
  const teams = await TeamService.find({
    match: { name: "Research Team Alpha" },
  });
  const team = teams[0];

  if (team) {
    // Update admin user to include first team
    await UserService.updateById(admin._id, {
      teams: [
        {
          team: team._id,
          role: "ADMIN",
        },
      ],
    });
  }
}

export async function getSeededTeams() {
  return await TeamService.find({
    match: { name: { $in: SEED_TEAMS.map((t) => t.name) } },
  });
}
