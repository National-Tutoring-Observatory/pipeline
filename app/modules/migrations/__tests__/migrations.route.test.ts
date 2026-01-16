import { beforeEach, describe, expect, it, vi } from 'vitest'
import { action, loader } from '../containers/migrations.route'
import { clearMigrationsCache } from '../registry'
import type { Route } from '../containers/+types/migrations.route'
import clearDocumentDB from '../../../../test/helpers/clearDocumentDB'
import loginUser from '../../../../test/helpers/loginUser'
import { UserService } from '~/modules/users/user'

// Mock getQueue
vi.mock('~/modules/queues/helpers/getQueue', () => ({
  default: vi.fn(() => ({
    add: vi.fn().mockResolvedValue({ id: 'job-123' })
  }))
}))

describe('migrations.route', () => {
  beforeEach(async () => {
    await clearDocumentDB()
    clearMigrationsCache()
    vi.clearAllMocks()
  })

  describe('loader', () => {
    it('redirects if user is not authenticated', async () => {
      const res = (await loader({
        request: new Request('http://localhost/migrations'),
        params: {},
        unstable_pattern: '',
        context: {}
      }) as any)

      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/')
    })

    it('redirects if user is not a super admin', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'USER' })

      const cookieHeader = await loginUser(user._id)

      const res = (await loader({
        request: new Request('http://localhost/migrations', { headers: { cookie: cookieHeader } }),
        params: {},
        unstable_pattern: '',
        context: {}
      }) as any)

      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/')
    })

    it('returns migrations list for super admin', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

      const cookieHeader = await loginUser(user._id)

      const res = (await loader({
        request: new Request('http://localhost/migrations', { headers: { cookie: cookieHeader } }),
        params: {},
        unstable_pattern: '',
        context: {}
      }) as any)

      expect(res.migrations).toBeDefined()
      expect(Array.isArray(res.migrations)).toBe(true)
    })

    it('includes migration status (pending/running/completed) in response', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

      const cookieHeader = await loginUser(user._id)

      const res = (await loader({
        request: new Request('http://localhost/migrations', { headers: { cookie: cookieHeader } }),
        params: {},
        unstable_pattern: '',
        context: {}
      }) as any)

      if (res.migrations.length > 0) {
        const migration = res.migrations[0]
        expect(migration.status).toBeDefined()
        expect(['pending', 'running', 'completed', 'failed']).toContain(migration.status)
      }
    })
  })

  describe('action', () => {
    it('throws error if user is not authenticated', async () => {
      const request = new Request('http://localhost/migrations', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'RUN_MIGRATION',
          payload: { migrationId: 'test-migration' }
        })
      })

      await expect(action({
        request,
        params: {},
        unstable_pattern: '',
        context: {}
      } as Route.ActionArgs)).rejects.toThrow('Access denied')
    })

    it('throws error if user is not a super admin', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'USER' })

      const cookieHeader = await loginUser(user._id)

      const request = new Request('http://localhost/migrations', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'RUN_MIGRATION',
          payload: { migrationId: 'test-migration' }
        }),
        headers: { cookie: cookieHeader }
      })

      await expect(action({
        request,
        params: {},
        unstable_pattern: '',
        context: {}
      } as Route.ActionArgs)).rejects.toThrow('Access denied')
    })

    it('throws error if migrationId is not provided', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

      const cookieHeader = await loginUser(user._id)

      const request = new Request('http://localhost/migrations', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'RUN_MIGRATION',
          payload: {}
        }),
        headers: { cookie: cookieHeader }
      })

      await expect(action({
        request,
        params: {},
        unstable_pattern: '',
        context: {}
      } as Route.ActionArgs)).rejects.toThrow('migrationId is required')
    })

    it('throws error if invalid intent is provided', async () => {
      const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

      const cookieHeader = await loginUser(user._id)

      const request = new Request('http://localhost/migrations', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'INVALID_INTENT',
          payload: { migrationId: 'test-migration' }
        }),
        headers: { cookie: cookieHeader }
      })

      await expect(action({
        request,
        params: {},
        unstable_pattern: '',
        context: {}
      } as Route.ActionArgs)).rejects.toThrow('Invalid intent')
    })

    it('queues RUN_MIGRATION job for super admin', async () => {
      const { default: getQueue } = await import('~/modules/queues/helpers/getQueue')
      const mockQueue = {
        add: vi.fn().mockResolvedValue({ id: 'job-123' })
      }
      ;(getQueue as any).mockReturnValue(mockQueue)

      const user = await UserService.create({ username: 'test_user', role: 'SUPER_ADMIN' })

      const cookieHeader = await loginUser(user._id)

      const request = new Request('http://localhost/migrations', {
        method: 'POST',
        body: JSON.stringify({
          intent: 'RUN_MIGRATION',
          payload: { migrationId: 'test-migration-123' }
        }),
        headers: { cookie: cookieHeader }
      })

      const res = await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {}
      } as Route.ActionArgs)

      expect(res).toEqual({ success: true })
      expect(mockQueue.add).toHaveBeenCalledWith(
        'RUN_MIGRATION',
        expect.objectContaining({
          migrationId: 'test-migration-123',
          userId: user._id,
          props: expect.objectContaining({
            event: 'migration:update',
            task: 'test-migration-123'
          })
        })
      )
    })
  })
})
