import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'
import type { Db } from 'mongodb'

export default {
  id: '20260112142830-backfill-performed-by-for-audits',
  name: 'Backfill Performed By For Audits',
  description: 'Backfill performedBy and performedByUsername from context.target for audit records',

  async up(db: Db): Promise<MigrationResult> {
    const auditCollection = db.collection('audits')
    const usersCollection = db.collection('users')

    console.log('Starting Backfill Performed By For Audits migration...')

    // Find audits missing performedBy
    const auditsMissingPerformedBy = await auditCollection
      .find({ performedBy: { $exists: false }, 'context.target': { $exists: true } })
      .toArray()

    console.log(`Found ${auditsMissingPerformedBy.length} audits missing performedBy`)

    let migrated = 0
    let failed = 0

    for (const audit of auditsMissingPerformedBy) {
      try {
        const userId = audit.context?.target
        
        if (!userId) {
          console.warn(`  ⚠️ Audit ${audit._id} has no context.target`)
          failed++
          continue
        }

        // Look up user to get username
        const user = await usersCollection.findOne({ _id: userId })
        const username = user?.username || 'unknown'

        console.log(`  ✓ Backfilling audit ${audit._id}: performedBy=${userId}, performedByUsername=${username}`)

        await auditCollection.updateOne(
          { _id: audit._id },
          {
            $set: {
              performedBy: userId,
              performedByUsername: username
            }
          }
        )

        migrated++
      } catch (error) {
        console.error(`  ❌ Failed to backfill audit ${audit._id}:`, error)
        failed++
      }
    }

    console.log(`\n✓ Migration complete: ${migrated} backfilled, ${failed} failed`)

    return {
      success: failed === 0,
      message: `Backfilled ${migrated} audit records with performedBy and performedByUsername`,
      stats: { migrated, failed }
    }
  }
} satisfies MigrationFile
