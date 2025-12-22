import type { Db } from 'mongodb'
import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'

export default {
  id: '20251219085527-set-prompt-created-by',
  name: 'Set Prompt CreatedBy',
  description: 'Sets createdBy field for all prompts that lack it. Assigns the first team admin as the creator.',

  async up(db: Db): Promise<MigrationResult> {
    const promptsCollection = db.collection('prompts')
    const teamsCollection = db.collection('teams')

    const promptsWithoutCreatedBy = await promptsCollection
      .find({
        createdBy: { $exists: false }
      })
      .toArray()

    if (promptsWithoutCreatedBy.length === 0) {
      return {
        success: true,
        message: 'No prompts found without createdBy',
        stats: { migrated: 0, failed: 0 }
      }
    }

    let migrated = 0
    let failed = 0

    for (const prompt of promptsWithoutCreatedBy) {
      try {
        // Find the team and get the first admin
        const team = await teamsCollection.findOne({ _id: prompt.team })

        if (!team) {
          console.warn(`Team not found for prompt ${prompt._id}`)
          failed++
          continue
        }

        // Find the first admin in the team
        const usersCollection = db.collection('users')
        let creator = await usersCollection.findOne({
          teams: {
            $elemMatch: {
              team: prompt.team,
              role: 'ADMIN'
            }
          }
        })

        // Fallback: if no team admin found, use the first SUPER_ADMIN
        if (!creator) {
          creator = await usersCollection.findOne({
            role: 'SUPER_ADMIN'
          })

          if (!creator) {
            console.warn(`No admin or super admin found for prompt ${prompt._id}`)
            failed++
            continue
          }
        }

        // Update the prompt with createdBy
        await promptsCollection.updateOne(
          { _id: prompt._id },
          { $set: { createdBy: creator._id } }
        )

        migrated++
      } catch (error) {
        console.error(`Failed to migrate prompt ${prompt._id}:`, error)
        failed++
      }
    }

    return {
      success: failed === 0,
      message: `Migrated ${migrated} prompts with createdBy`,
      stats: { migrated, failed }
    }
  },

  async down(db: Db): Promise<MigrationResult> {
    const promptsCollection = db.collection('prompts')

    // Remove createdBy field that was added in this migration
    const result = await promptsCollection.updateMany(
      {},
      { $unset: { createdBy: '' } }
    )

    return {
      success: true,
      message: `Removed createdBy from ${result.modifiedCount} prompts`,
      stats: { removed: result.modifiedCount, failed: 0 }
    }
  }
} as MigrationFile
