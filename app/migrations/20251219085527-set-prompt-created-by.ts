import type { Db } from 'mongodb'
import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'

export default {
  id: '20251219085527-set-prompt-created-by',
  name: 'Set Prompt CreatedBy',
  description: 'Sets createdBy field for all prompts that lack it. Assigns the first team admin as the creator.',

  async up(db: Db): Promise<MigrationResult> {
    const promptsCollection = db.collection('prompts')
    const teamsCollection = db.collection('teams')

    console.log('Starting Set Prompt CreatedBy migration...')

    const promptsWithoutCreatedBy = await promptsCollection
      .find({
        createdBy: { $exists: false }
      })
      .toArray()

    console.log(`Found ${promptsWithoutCreatedBy.length} prompts without createdBy`)

    if (promptsWithoutCreatedBy.length === 0) {
      return {
        success: true,
        message: 'No prompts found without createdBy',
        stats: { migrated: 0, failed: 0 }
      }
    }

    let migrated = 0
    let failed = 0
    let deleted = 0

    for (const prompt of promptsWithoutCreatedBy) {
      console.log(`\nProcessing prompt ${prompt._id}`)
      console.log(`  Prompt.team type: ${typeof prompt.team}, value: ${prompt.team}`)

      try {
        // Find the team and get the first admin
        const team = await teamsCollection.findOne({ _id: prompt.team })

        if (!team) {
          console.warn(`  ❌ Team not found for prompt ${prompt._id} (looking for team._id = ${prompt.team}) - DELETING ORPHAN`)
          await promptsCollection.deleteOne({ _id: prompt._id })
          deleted++
          continue
        }

        console.log(`  ✓ Team found: ${team._id}`)

        // Find the first admin in the team
        const usersCollection = db.collection('users')
        console.log(`  Searching for team admin with teams.team = ${prompt.team}`)

        let creator = await usersCollection.findOne({
          teams: {
            $elemMatch: {
              team: prompt.team,
              role: 'ADMIN'
            }
          }
        })

        if (creator) {
          console.log(`  ✓ Found team admin: ${creator._id} (${creator.username})`)
        } else {
          console.log(`  ℹ No team admin found, looking for SUPER_ADMIN`)
        }

        // Fallback: if no team admin found, use the first SUPER_ADMIN
        if (!creator) {
          creator = await usersCollection.findOne({
            role: 'SUPER_ADMIN'
          })

          if (creator) {
            console.log(`  ✓ Found super admin: ${creator._id} (${creator.username})`)
          } else {
            console.warn(`  ❌ No admin or super admin found for prompt ${prompt._id}`)
            failed++
            continue
          }
        }

        // Update the prompt with createdBy
        const updateResult = await promptsCollection.updateOne(
          { _id: prompt._id },
          { $set: { createdBy: creator._id } }
        )

        console.log(`  ✓ Updated prompt with createdBy: ${creator._id} (matched: ${updateResult.matchedCount}, modified: ${updateResult.modifiedCount})`)
        migrated++
      } catch (error) {
        console.error(`  ❌ Failed to migrate prompt ${prompt._id}:`, error)
        failed++
      }
    }

    console.log(`\n✓ Migration complete: ${migrated} migrated, ${deleted} deleted orphans, ${failed} failed`)

    return {
      success: failed === 0,
      message: `Migrated ${migrated} prompts with createdBy (deleted ${deleted} orphans)`,
      stats: { migrated, deleted, failed }
    }
  }
} as MigrationFile
