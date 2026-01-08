import getDocumentsAdapter from '../../app/modules/documents/helpers/getDocumentsAdapter.js';
import type { User } from '../../app/modules/users/users.types.js';

// Use SUPER_ADMIN_GITHUB_ID from env if available, otherwise use test ID
const superAdminGithubId = process.env.SUPER_ADMIN_GITHUB_ID ? parseInt(process.env.SUPER_ADMIN_GITHUB_ID) : 100001;

const SEED_USERS = [
  {
    username: 'testadmin',
    role: 'SUPER_ADMIN',
    githubId: superAdminGithubId,
    hasGithubSSO: true,
    isRegistered: true,
    featureFlags: [],
    teams: [],
    registeredAt: new Date().toISOString(),
  },
  {
    username: 'testuser1',
    role: 'USER',
    githubId: 100002,
    hasGithubSSO: true,
    isRegistered: true,
    featureFlags: [],
    teams: [],
    registeredAt: new Date().toISOString(),
  },
  {
    username: 'testuser2',
    role: 'USER',
    githubId: 100003,
    hasGithubSSO: true,
    isRegistered: true,
    featureFlags: [],
    teams: [],
    registeredAt: new Date().toISOString(),
  },
];

export async function seedUsers() {
  const documents = getDocumentsAdapter();

  for (const userData of SEED_USERS) {
    try {
      // Check if user already exists
      const existing = await documents.getDocuments<User>({
        collection: 'users',
        match: { githubId: userData.githubId },
        sort: {},
      });

      if (existing.data.length > 0) {
        console.log(`  ⏭️  User '${userData.username}' already exists, skipping...`);
        continue;
      }

      const result = await documents.createDocument<User>({
        collection: 'users',
        update: userData,
      });

      console.log(`  ✓ Created user: ${userData.username} (ID: ${result.data._id})`);
    } catch (error) {
      console.error(`  ✗ Error creating user ${userData.username}:`, error);
      throw error;
    }
  }
}

export async function getSeededUsers() {
  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<User>({
    collection: 'users',
    match: { username: { $in: SEED_USERS.map(u => u.username) } },
    sort: {},
  });
  return result.data;
}
