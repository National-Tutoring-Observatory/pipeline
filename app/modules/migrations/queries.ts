import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter'
import { getAllMigrations } from './registry'
import type { Migration, MigrationDirection, MigrationResult, MigrationStatus } from './types'

const COLLECTION = 'migrations'

export async function createMigrationRun(data: {
  migrationId: string
  direction: MigrationDirection
  triggeredBy: string
  jobId: string
}) {
  const adapter = getDocumentsAdapter()
  const doc = await adapter.createDocument<Migration>({
    collection: COLLECTION,
    update: {
      ...data,
      status: 'running' as MigrationStatus,
      startedAt: new Date()
    }
  })
  return doc.data
}

export async function updateMigrationRun(
  id: string,
  updates: {
    status: MigrationStatus
    completedAt?: Date
    result?: MigrationResult
    error?: string
  }
) {
  const adapter = getDocumentsAdapter()
  const doc = await adapter.updateDocument<Migration>({
    collection: COLLECTION,
    match: { _id: id },
    update: updates
  })
  return doc.data
}

export async function completeMigrationRun(id: string, result: MigrationResult) {
  return updateMigrationRun(id, {
    status: 'completed',
    completedAt: new Date(),
    result
  })
}

export async function failMigrationRun(id: string, error: string) {
  return updateMigrationRun(id, {
    status: 'failed',
    completedAt: new Date(),
    error
  })
}

export async function getMigrationHistory() {
  const adapter = getDocumentsAdapter()
  const history = await adapter.getDocuments<Migration>({
    collection: COLLECTION,
    match: {},
    sort: { startedAt: -1 }
  })
  return history.data
}

export async function getLastMigrationRun(migrationId: string) {
  const adapter = getDocumentsAdapter()
  const runs = await adapter.getDocuments<Migration>({
    collection: COLLECTION,
    match: { migrationId },
    sort: { startedAt: -1 },
    pageSize: 1
  })
  return runs.data[0] || null
}

export async function getMigrationStatus(migrationId: string) {
  const adapter = getDocumentsAdapter()
  const runs = await adapter.getDocuments<Migration>({
    collection: COLLECTION,
    match: { migrationId, status: { $in: ['completed', 'running'] } },
    sort: { startedAt: -1 }
  })

  const isRunning = runs.data.some((r) => r.status === 'running')
  if (isRunning) return 'running'

  const hasCompleted = runs.data.some((r) => r.status === 'completed')
  if (hasCompleted) return 'completed'

  return 'pending'
}

export async function getMigrationsWithStatus() {
  const migrations = await getAllMigrations()
  const statuses = await Promise.all(
    migrations.map(async (migration: any) => {
      const status = await getMigrationStatus(migration.id)
      const lastRun = await getLastMigrationRun(migration.id)
      return {
        ...migration,
        status,
        lastRun
      }
    })
  )
  return statuses
}
