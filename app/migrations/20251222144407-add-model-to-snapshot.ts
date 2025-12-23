import type { Db } from 'mongodb'
import findModelByCode from '~/modules/llm/helpers/findModelByCode'
import type { MigrationFile, MigrationResult } from '~/modules/migrations/types'

/**
 * Maps old provider names to high-quality model codes
 * These were the defaults used before the system was refactored
 */
const OLD_PROVIDER_TO_MODEL_CODE: Record<string, string> = {
  'CHAT_GPT': 'openai.gpt-4.1',
  'GEMINI': 'google.gemini-2.5-flash',
  'CLAUDE': 'anthropic.claude-4-sonnet'
}

/**
 * Maps old provider names to new provider names
 */
const OLD_PROVIDER_TO_NEW_NAME: Record<string, string> = {
  'CHAT_GPT': 'OpenAI',
  'GEMINI': 'Google',
  'CLAUDE': 'Anthropic'
}

export default {
  id: '20251222144407-add-model-to-snapshot',
  name: 'Add Model To Snapshot',
  description: 'Backfill runs with structured model information in snapshots, mapping old provider names to new model codes',

  async up(db: Db): Promise<MigrationResult> {
    const runsCollection = db.collection('runs')

    // Find all runs that have a model but no snapshot.model
    const runs = await runsCollection
      .find({
        model: { $exists: true, $ne: null },
        'snapshot.model': { $exists: false }
      })
      .toArray()

    let migrated = 0
    let failed = 0
    let mappedFromOldProvider = 0
    let missingModelConfig = 0

    console.log(`Found ${runs.length} runs to backfill with model snapshots`)

    for (const run of runs) {
      if (!run.model) continue

      try {
        // Step 1: Map old provider names to model codes if needed
        let modelCode = run.model
        let providerName: string | undefined

        const oldProviderName = OLD_PROVIDER_TO_MODEL_CODE[run.model]
        const newProviderName = OLD_PROVIDER_TO_NEW_NAME[run.model]

        if (oldProviderName) {
          console.log(`Mapping old provider name "${run.model}" to model code "${oldProviderName}"`)
          modelCode = oldProviderName
          providerName = newProviderName
          mappedFromOldProvider++
        }

        // Step 2: Look up the model in the current config
        const modelInfo = findModelByCode(modelCode)
        const provider = modelInfo?.provider || providerName || 'Unknown'
        const name = modelInfo?.name || modelCode

        // Step 3: Update the run with snapshot.model (now includes display name)
        await runsCollection.updateOne(
          { _id: run._id },
          {
            $set: {
              'snapshot.model': { code: modelCode, provider, name }
            }
          }
        )
        console.log(`Updated run ${run._id} with model code: ${modelCode}, provider: ${provider}, name: ${name}`)
        migrated++

        if (!modelInfo) {
          console.warn(`Model config not found for run ${run._id} with code: ${modelCode}`)
          missingModelConfig++
        }
      } catch (error) {
        failed++
        console.error(`Failed to migrate run ${run._id}:`, error)
      }
    }

    const message = `Migration completed: ${migrated} runs updated, ${mappedFromOldProvider} mapped from old provider names, ${missingModelConfig} with missing config, ${failed} failed`

    return {
      success: failed === 0,
      message,
      stats: {
        total: runs.length,
        migrated,
        failed,
        mappedFromOldProvider,
        missingModelConfig
      }
    }
  }
} satisfies MigrationFile
