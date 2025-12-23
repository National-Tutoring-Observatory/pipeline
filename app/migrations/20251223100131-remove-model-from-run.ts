import type { MigrationFile } from '~/modules/migrations/types';

export default {
  id: '20251223100131-remove-model-from-run',
  name: 'Remove Model From Run',
  description: 'Remove Model from Run',

  async up(db) {

    const runsCollection = db.collection('runs');
    const result = await runsCollection.updateMany(
      { model: { $exists: true } },
      { $unset: { model: "" } }
    );

    return {
      success: true,
      message: `Migration completed: removed 'model' from ${result.modifiedCount} runs`,
      stats: { migrated: result.modifiedCount, failed: 0 }
    }

  }
} satisfies MigrationFile
