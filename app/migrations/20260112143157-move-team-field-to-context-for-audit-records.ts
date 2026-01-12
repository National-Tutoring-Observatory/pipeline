import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'
import type { Db } from 'mongodb'

export default {
  id: '20260112143157-move-team-field-to-context-for-audit-records',
  name: 'Move Team Field To Context For Audit Records',
  description: 'Move team field from top level to context.team for audit records that lack it',

  async up(db: Db): Promise<MigrationResult> {
    const auditCollection = db.collection('audits')

    console.log('Starting Move Team Field To Context For Audit Records migration...')

    // Find audits with team field at top level
    const auditsWithTeamField = await auditCollection
      .find({ team: { $exists: true } })
      .toArray()

    console.log(`Found ${auditsWithTeamField.length} audits with team field at top level`)

    if (auditsWithTeamField.length === 0) {
      return {
        success: true,
        message: 'No audits found with team field at top level',
        stats: { migrated: 0, failed: 0 }
      }
    }

    let migrated = 0
    let failed = 0

    for (const audit of auditsWithTeamField) {
      try {
        console.log(`  Processing audit ${audit._id}, team: ${audit.team}`)

        // Move team to context.team
        await auditCollection.updateOne(
          { _id: audit._id },
          [
            {
              $set: {
                context: {
                  $mergeObjects: [
                    '$context',
                    { team: '$team' }
                  ]
                }
              }
            },
            {
              $unset: 'team'
            }
          ]
        )

        console.log(`  ✓ Moved team to context.team for audit ${audit._id}`)
        migrated++
      } catch (error) {
        console.error(`  ❌ Failed to migrate audit ${audit._id}:`, error)
        failed++
      }
    }

    console.log(`\n✓ Migration complete: ${migrated} migrated, ${failed} failed`)

    return {
      success: failed === 0,
      message: `Moved team field to context.team for ${migrated} audit records`,
      stats: { migrated, failed }
    }
  }
} satisfies MigrationFile
