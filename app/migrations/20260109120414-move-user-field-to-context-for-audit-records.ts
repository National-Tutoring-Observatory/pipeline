import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'
import type { Db } from 'mongodb'

export default {
  id: '20260109120414-move-user-field-to-context-for-audit-records',
  name: 'Move User Field To Context For Audit Records',
  description: 'Move user field from top level to context.target for audit records',

  async up(db: Db): Promise<MigrationResult> {
    const auditCollection = db.collection('audits')

    // Rename ADD_SUPERADMIN to SUPERADMIN_REQUEST_TEAM_ADMIN for old team admin assignments
    const renamedResult = await auditCollection.updateMany(
      { action: 'ADD_SUPERADMIN', team: { $exists: true } },
      { $set: { action: 'SUPERADMIN_REQUEST_TEAM_ADMIN' } }
    )

    // Move user field to context.target
    const result = await auditCollection.updateMany(
      { user: { $exists: true } },
      [
        {
          $set: {
            context: {
              $mergeObjects: [
                '$context',
                { target: '$user' }
              ]
            }
          }
        },
        {
          $unset: ['user']
        }
      ]
    )

    return {
      success: true,
      message: 'Migration completed successfully',
      stats: { migrated: renamedResult.modifiedCount + result.modifiedCount, failed: 0 }
    }
  }
} satisfies MigrationFile
