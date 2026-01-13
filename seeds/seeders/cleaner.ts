import getDocumentsAdapter from '../../app/modules/documents/helpers/getDocumentsAdapter.js';
import { UserService } from '../../app/modules/users/user.js';
import { ProjectService } from '../../app/modules/projects/project.js';
import getStorageAdapter from '../../app/modules/storage/helpers/getStorageAdapter.js';

/**
 * Cleans all seeded data from the database and storage
 */
export async function cleanAll() {
  const documents = getDocumentsAdapter();
  const storage = getStorageAdapter();

  try {
    // Get all projects to clean their storage
    const projects = await ProjectService.find({});

    // Clean storage for each project
    for (const project of projects) {
      try {
        await storage.removeDir({ sourcePath: `storage/${project._id}` });
        console.log(`  ✓ Cleaned storage for project: ${project.name}`);
      } catch (error) {
        // Ignore errors if directory doesn't exist
        if (error instanceof Error && !error.message.includes('ENOENT')) {
          console.warn(`  ⚠️  Error cleaning storage for project ${project.name}:`, error.message);
        }
      }
    }

    // Delete collections in order (to respect references)
    const collections = [
      'collections',
      'files',
      'projects',
      'prompts',
      'runs',
      'sessions',
      'teams',
      'users',
    ];

    for (const collection of collections) {
      try {
        await documents.deleteDocuments({
          collection,
          match: {},
        });
        console.log(`  ✓ Cleaned documents from ${collection}`);
      } catch (error) {
        console.warn(`  ⚠️  Error cleaning ${collection}:`, error instanceof Error ? error.message : error);
      }
    }
  } catch (error) {
    console.error('  ✗ Error during cleanup:', error);
    throw error;
  }
}

/**
 * Cleans only seeded test data (based on known test identifiers)
 */
export async function cleanSeededOnly() {
  const documents = getDocumentsAdapter();

  try {
    // Clean seeded users (by githubId range)
    const seededUsers = await UserService.find({ match: { githubId: { $gte: 100001, $lte: 100003 } } });

    for (const user of seededUsers) {
      await documents.deleteDocument({
        collection: 'users',
        match: { _id: user._id },
      });
    }

    if (seededUsers.length > 0) {
      console.log(`  ✓ Cleaned ${seededUsers.length} seeded users`);
    }

    // Clean seeded teams (by name pattern)
    const seededTeams = await documents.getDocuments({
      collection: 'teams',
      match: { name: { $regex: /(Research Team|Education Lab)/ } },
      sort: {},
    });

    for (const team of seededTeams.data) {
      await documents.deleteDocument({
        collection: 'teams',
        match: { _id: team._id },
      });
    }

    if (seededTeams.data.length > 0) {
      console.log(`  ✓ Cleaned ${seededTeams.data.length} seeded teams`);
    }

    // Note: Projects and files will be orphaned but can be identified by team reference
  } catch (error) {
    console.error('  ✗ Error during seeded cleanup:', error);
    throw error;
  }
}
