import getDatabaseConnection from 'app/documentsAdapters/documentDB/helpers/getDatabaseConnection'
import { MigrationRunService } from 'app/modules/migrations/migrationRun'
import { getAllMigrations } from 'app/modules/migrations/registry'
import type { Job } from 'bullmq'
import emitFromJob from '../helpers/emitFromJob'

export default async function runMigration(job: Job) {
  const { migrationId, userId } = job.data || {}

  if (!migrationId) {
    throw new Error('missing migrationId')
  }

  if (!userId) {
    throw new Error('missing userId')
  }

  // Establish database connection before any operations
  const { connection } = await getDatabaseConnection()
  const db = connection.db

  if (!db) {
    throw new Error('Database connection not established')
  }

  const migrations = await getAllMigrations()
  const migration = migrations.find(m => m.id === migrationId)

  if (!migration) {
    throw new Error(`Migration not found: ${migrationId}`)
  }

  const historyDoc = await MigrationRunService.create({
    migrationId,
    triggeredBy: userId,
    jobId: job.id!
  })

  await emitFromJob(job, {
    migrationId,
    status: 'STARTED'
  }, 'STARTED')

  try {
    const result = await migration.up(db)

    if (result.success) {
      await MigrationRunService.updateById(historyDoc._id, {
        status: 'completed',
        completedAt: new Date(),
        result
      })

      await emitFromJob(job, {
        migrationId,
        result,
        status: 'FINISHED'
      }, 'FINISHED')

      return { status: 'COMPLETED', migrationId, result }
    } else {
      await MigrationRunService.updateById(historyDoc._id, {
        status: 'failed',
        completedAt: new Date(),
        error: result.message
      })

      await emitFromJob(job, {
        migrationId,
        error: result.message,
        status: 'ERRORED'
      }, 'ERRORED')

      throw new Error(result.message)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    await MigrationRunService.updateById(historyDoc._id, {
      status: 'failed',
      completedAt: new Date(),
      error: errorMessage
    })

    await emitFromJob(job, {
      migrationId,
      error: errorMessage,
      status: 'ERRORED'
    }, 'ERRORED')

    throw error
  }
}
