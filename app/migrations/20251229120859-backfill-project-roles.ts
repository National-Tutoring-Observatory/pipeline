import type { MigrationFile } from '~/modules/migrations/types'
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter'
import fse from 'fs-extra'

export default {
  id: '20251229120859-backfill-project-roles',
  name: 'Backfill Project Roles',
  description: 'Backfill roles and leadRole fields on projects from session pre-analysis files',

  async up(db) {
    const storage = getStorageAdapter();

    const projects = await db.collection('projects').find({
      $or: [
        { roles: { $exists: false } },
        { roles: { $size: 0 } },
        { roles: null }
      ]
    }).toArray();

    let migrated = 0;
    let failed = 0;
    let skipped = 0;

    for (const project of projects) {
      try {
        const session = await db.collection('sessions').findOne({
          project: project._id,
          hasConverted: true
        });

        if (!session) {
          skipped++;
          continue;
        }

        const filePath = `storage/${project._id}/preAnalysis/${session._id}/${session.name}`;

        let fileData;
        try {
          const downloadedPath = await storage.download({ sourcePath: filePath });
          fileData = await fse.readJSON(downloadedPath);
        } catch (error) {
          console.log(`Could not download or read file for project ${project._id}, session ${session._id}:`, error);
          skipped++;
          continue;
        }

        if (!fileData.transcript || !Array.isArray(fileData.transcript)) {
          skipped++;
          continue;
        }

        const uniqueRoles = [...new Set(fileData.transcript.map((utterance: { role: string }) => utterance.role))] as string[];
        const leadRole = fileData.leadRole || uniqueRoles[0] || 'TEACHER';

        await db.collection('projects').updateOne(
          { _id: project._id },
          { $set: { roles: uniqueRoles, leadRole } }
        );

        migrated++;
      } catch (error) {
        console.error(`Failed to backfill project ${project._id}:`, error);
        failed++;
      }
    }

    return {
      success: failed === 0,
      message: `Backfilled ${migrated} projects, skipped ${skipped}, failed ${failed}`,
      stats: { migrated, skipped, failed }
    }
  }
} satisfies MigrationFile
