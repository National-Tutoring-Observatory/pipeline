import { beforeEach, describe, expect, it } from 'vitest'
import '~/modules/documents/documents'
import { UserService } from '~/modules/users/user'
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB'
import { MigrationRunService } from '../migrationRun'

describe('MigrationRunService', () => {
  beforeEach(async () => {
    await clearDocumentDB()
  })

  describe('create', () => {
    it('creates migration run with running status', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

      const run = await MigrationRunService.create({
        migrationId: 'test-001',
        direction: 'up',
        triggeredBy: user._id,
        jobId: 'job-1'
      })

      expect(run._id).toBeDefined()
      expect(run.migrationId).toBe('test-001')
      expect(run.status).toBe('running')
      expect(run.startedAt).toBeDefined()
    })
  })

  describe('updateById', () => {
    it('updates a migration run status', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

      const run = await MigrationRunService.create({
        migrationId: 'test-001',
        direction: 'up',
        triggeredBy: user._id,
        jobId: 'job-1'
      })

      const updated = await MigrationRunService.updateById(run._id, {
        status: 'completed',
        completedAt: new Date(),
        result: { success: true, message: 'Done' }
      })

      expect(updated?.status).toBe('completed')
      expect(updated?.completedAt).toBeDefined()
      expect(updated?.result).toBeDefined()
    })
  })
})
