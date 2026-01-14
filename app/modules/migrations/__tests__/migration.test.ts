import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserService } from '~/modules/users/user'
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB'
import { MigrationService } from '../migration'
import { MigrationRunService } from '../migrationRun'
import * as registryModule from '../registry'

vi.mock('../registry')

describe('MigrationService', () => {
  beforeEach(async () => {
    await clearDocumentDB()
    vi.clearAllMocks()
  })

  describe('allWithStatus', () => {
    it('enriches migrations with status and last run data', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

      // Create a migration run
      const run = await MigrationRunService.create({
        migrationId: 'test-001',
        triggeredBy: user._id,
        jobId: 'job-1'
      })

      // Mock registry to return a migration
      vi.mocked(registryModule.getAllMigrations).mockResolvedValue([
        {
          id: 'test-001',
          name: 'Test Migration',
          description: 'Test migration description',
          up: vi.fn()
        }
      ] as any)

      const migrations = await MigrationService.allWithStatus()

      expect(migrations).toHaveLength(1)
      expect(migrations[0].id).toBe('test-001')
      expect(migrations[0].status).toBe('running')
      expect(migrations[0].lastRun).toBeDefined()
      expect(migrations[0].lastRun._id).toBe(run._id)
    })

    it('returns pending status for migrations with no runs', async () => {
      vi.mocked(registryModule.getAllMigrations).mockResolvedValue([
        {
          id: 'test-001',
          name: 'Test Migration',
          description: 'Test migration description',
          up: vi.fn()
        }
      ] as any)

      const migrations = await MigrationService.allWithStatus()

      expect(migrations).toHaveLength(1)
      expect(migrations[0].status).toBe('pending')
      expect(migrations[0].lastRun).toBeNull()
    })

    it('returns completed status after run completes', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

      const run = await MigrationRunService.create({
        migrationId: 'test-001',
        triggeredBy: user._id,
        jobId: 'job-1'
      })

      await MigrationRunService.updateById(run._id, {
        status: 'completed',
        completedAt: new Date(),
        result: { success: true, message: 'Done' }
      })

      vi.mocked(registryModule.getAllMigrations).mockResolvedValue([
        {
          id: 'test-001',
          name: 'Test Migration',
          description: 'Test migration description',
          up: vi.fn()
        }
      ] as any)

      const migrations = await MigrationService.allWithStatus()

      expect(migrations[0].status).toBe('completed')
      expect(migrations[0].lastRun).toBeDefined()
    })
  })
})
