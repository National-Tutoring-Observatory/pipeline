import type { Db } from 'mongodb'
import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'

export default {
  id: '20251216000000-addRunSnapshots',
  name: 'Add Run Snapshots',
  description: 'Builds RunSnapshot objects for all runs that have completed setup but lack snapshots. This ensures backward compatibility with runs created before the snapshot feature.',

  async up(db: Db): Promise<MigrationResult> {

    const runsCollection = db.collection('runs')
    const promptVersionsCollection = db.collection('promptversions')
    const promptsCollection = db.collection('prompts')

    const runsWithoutSnapshots = await runsCollection
      .find({
        hasSetup: true,
        snapshot: { $exists: false }
      })
      .toArray()

    if (runsWithoutSnapshots.length === 0) {
      return {
        success: true,
        message: 'No runs found without snapshots',
        stats: { migrated: 0, failed: 0 }
      }
    }

    let migrated = 0
    let failed = 0

    for (const run of runsWithoutSnapshots) {
      try {
        const promptVersion = await promptVersionsCollection.findOne({
          prompt: run.prompt,
          version: Number(run.promptVersion)
        })

        if (!promptVersion) {
          console.warn(`⚠ Prompt version not found for run ${run._id}: prompt=${run.prompt}, version=${run.promptVersion}`)
          failed++
          continue
        }

        const prompt = await promptsCollection.findOne({
          _id: run.prompt
        })

        if (!prompt) {
          console.warn(`⚠ Prompt not found for run ${run._id}: prompt=${run.prompt}`)
          failed++
          continue
        }

        const snapshot = {
          prompt: {
            name: prompt.name,
            userPrompt: promptVersion.userPrompt,
            annotationSchema: promptVersion.annotationSchema,
            annotationType: prompt.annotationType,
            version: promptVersion.version
          }
        }

        const result = await runsCollection.updateOne(
          { _id: run._id },
          { $set: { snapshot } }
        )

        if (result.modifiedCount === 1) {
          migrated++
        } else {
          failed++
          console.warn(`⚠ Failed to update run ${run._id}`)
        }
      } catch (error) {
        failed++
        const message = error instanceof Error ? error.message : String(error)
        console.error(`✗ Error migrating run ${run._id}: ${message}`)
      }
    }

    return {
      success: failed === 0,
      message: `Migrated ${migrated} runs, ${failed} failed`,
      stats: { migrated, failed }
    }
  }
} satisfies MigrationFile
