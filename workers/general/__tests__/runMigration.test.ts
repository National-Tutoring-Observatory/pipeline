import { beforeEach, describe, expect, it, vi } from 'vitest'
import 'app/modules/documents/documents'
import { UserService } from 'app/modules/users/user'
import clearDocumentDB from '../../../test/helpers/clearDocumentDB'
import { MigrationRunService } from 'app/modules/migrations/migrationRun'
import runMigration from '../runMigration'
import type { Job } from 'bullmq'
import * as registryModule from 'app/modules/migrations/registry'

vi.mock('app/modules/migrations/registry')
vi.mock('../../helpers/emitFromJob')

describe('runMigration worker', () => {
  beforeEach(async () => {
    await clearDocumentDB()
    vi.clearAllMocks()
  })

  it('throws error if migrationId is missing', async () => {
    const job = {
      id: 'job-1',
      data: { userId: 'user-123' }
    } as any as Job

    await expect(runMigration(job)).rejects.toThrow('missing migrationId')
  })

  it('throws error if userId is missing', async () => {
    const job = {
      id: 'job-1',
      data: { migrationId: 'migration-123' }
    } as any as Job

    await expect(runMigration(job)).rejects.toThrow('missing userId')
  })

  it('throws error if migration not found', async () => {
    ;(vi.mocked(registryModule.getAllMigrations) as any).mockResolvedValue([])

    const job = {
      id: 'job-1',
      data: { migrationId: 'nonexistent-migration', userId: 'user-123' }
    } as any as Job

    await expect(runMigration(job)).rejects.toThrow('Migration not found: nonexistent-migration')
  })

  it('creates and updates migration run records', async () => {
    const { default: emitFromJob } = await import('../../helpers/emitFromJob')

    const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

    const mockUpFn = vi.fn().mockResolvedValue({
      success: true,
      message: 'Migration completed'
    })

    ;(vi.mocked(registryModule.getAllMigrations) as any).mockResolvedValue([
      {
        id: 'test-migration-123',
        name: 'Test Migration',
        description: 'Test migration',
        up: mockUpFn
      }
    ])

    const job = {
      id: 'job-123',
      data: { migrationId: 'test-migration-123', userId: user._id.toString() }
    } as any as Job

    await runMigration(job)

    // Verify migration run was created and completed
    const runs = await MigrationRunService.find({ match: { migrationId: 'test-migration-123' } })
    expect(runs).toHaveLength(1)
    expect(runs[0].status).toBe('completed')
    expect(runs[0].jobId).toBe('job-123')
    expect(runs[0].result).toBeDefined()
    expect(runs[0].result?.success).toBe(true)
  })

  it('does not include direction in emitted events', async () => {
    const { default: emitFromJob } = await import('../../helpers/emitFromJob')

    const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

    const mockUpFn = vi.fn().mockResolvedValue({
      success: true,
      message: 'Migration completed'
    })

    ;(vi.mocked(registryModule.getAllMigrations) as any).mockResolvedValue([
      {
        id: 'test-migration-456',
        name: 'Test Migration',
        description: 'Test migration',
        up: mockUpFn
      }
    ])

    const job = {
      id: 'job-1',
      data: { migrationId: 'test-migration-456', userId: user._id.toString() }
    } as any as Job

    await runMigration(job)

    const emitCalls = (emitFromJob as any).mock.calls
    expect(emitCalls.length).toBeGreaterThan(0)
    emitCalls.forEach((call: any[]) => {
      const eventData = call[1]
      expect(eventData).not.toHaveProperty('direction')
    })
  })
})
