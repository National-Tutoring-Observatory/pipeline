import getDatabaseConnection from 'app/documentsAdapters/documentDB/helpers/getDatabaseConnection'
import { completeMigrationRun, createMigrationRun, failMigrationRun } from 'app/modules/migrations/queries'
import { getAllMigrations } from 'app/modules/migrations/registry'
import type { Job } from 'bullmq'
import emitFromJob from '../helpers/emitFromJob'

export default async function runMigration(job: Job) {
  const { migrationId, direction = 'up', userId } = job.data || {}

  if (!migrationId) {
    throw new Error('missing migrationId')
  }

  if (!userId) {
    throw new Error('missing userId')
  }

  const migrations = await getAllMigrations()
  const migration = migrations.find(m => m.id === migrationId)

  if (!migration) {
    throw new Error(`Migration not found: ${migrationId}`)
  }

  const historyDoc = await createMigrationRun({
    migrationId,
    direction,
    triggeredBy: userId,
    jobId: job.id!
  })

  await emitFromJob(job, {
    migrationId,
    direction,
    status: 'STARTED'
  }, 'STARTED')

  const { connection } = await getDatabaseConnection()
  const db = connection.db

  if (!db) {
    throw new Error('Database connection not established')
  }

  try {
    const result = await migration.up(db)

    if (result.success) {
      await completeMigrationRun(historyDoc._id, result)

      await emitFromJob(job, {
        migrationId,
        direction,
        result,
        status: 'FINISHED'
      }, 'FINISHED')

      return { status: 'COMPLETED', migrationId, direction, result }
    } else {
      await failMigrationRun(historyDoc._id, result.message)

      await emitFromJob(job, {
        migrationId,
        direction,
        error: result.message,
        status: 'ERRORED'
      }, 'ERRORED')

      throw new Error(result.message)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    await failMigrationRun(historyDoc._id, errorMessage)

    await emitFromJob(job, {
      migrationId,
      direction,
      error: errorMessage,
      status: 'ERRORED'
    }, 'ERRORED')

    throw error
  }
}
