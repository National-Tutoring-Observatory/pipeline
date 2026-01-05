import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'

export default {
  id: '20260105113232-remove-direction-from-migrations',
  name: 'Remove Direction From Migrations',
  description: 'Remove Direction From Migrations',

  async up(db): Promise<MigrationResult> {
    const collection = db.collection('migrations')
    const result = await collection.updateMany(
      {},
      { $unset: { direction: '' } }
    )

    return {
      success: true,
      message: 'Removed direction field from migration records',
      stats: { modified: result.modifiedCount }
    }
  }
} satisfies MigrationFile
