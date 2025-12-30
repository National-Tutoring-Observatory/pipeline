import { TeamService } from '../../app/modules/teams/team.js';
import getDocumentsAdapter from '../../app/modules/documents/helpers/getDocumentsAdapter.js';
import type { User } from '../../app/modules/users/users.types.js';
import { getSeededUsers } from './userSeeder.js';

const SEED_TEAMS = [
  {
    name: 'Research Team Alpha',
  },
  {
    name: 'Education Lab Beta',
  },
];

export async function seedTeams() {
  const documents = getDocumentsAdapter();
  const users = await getSeededUsers();

  if (users.length === 0) {
    console.warn('  ⚠️  No seeded users found. Please run user seeder first.');
    return;
  }

  const admin = users.find(u => u.role === 'SUPER_ADMIN');
  if (!admin) {
    console.warn('  ⚠️  No admin user found.');
    return;
  }

  // Find the existing "local" user (if it exists from previous login)
  const localUserResult = await documents.getDocuments<User>({
    collection: 'users',
    match: { username: 'local' },
    sort: {},
  });
  const localUser = localUserResult.data[0];

  if (localUser) {
    console.log(`  ℹ️  Found 'local' user, will add to Research Team Alpha`);
  }

  for (const teamData of SEED_TEAMS) {
    try {
      // Check if team already exists
      const existing = await TeamService.findByName(teamData.name);

      if (existing) {
        console.log(`  ⏭️  Team '${teamData.name}' already exists, skipping...`);
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
  const team = await TeamService.findByName('Research Team Alpha');

  // Update admin user to include first team
  await documents.updateDocument<User>({
    collection: 'users',
    match: { _id: admin._id },
    update: {
      teams: [{
        team: team!._id,
        role: 'ADMIN',
      }],
    }
  });
}

export async function getSeededTeams() {
  return await TeamService.find({ name: { $in: SEED_TEAMS.map(t => t.name) } });
}
