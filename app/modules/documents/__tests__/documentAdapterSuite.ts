import { beforeAll, beforeEach, afterEach, describe, expect, it } from 'vitest'
import type { DocumentAdapter } from '../documents.types'

export type AdapterFactory = () => Promise<{
  adapter: DocumentAdapter
  prepare?: () => Promise<void>
}>

export function runDocumentAdapterTests(makeAdapter: AdapterFactory) {
  describe('Document adapter contract tests', () => {
    let adapter: DocumentAdapter
    let prepare: (() => Promise<void>) | undefined

    const collection = 'users';

    beforeAll(async () => {
      const res = await makeAdapter()
      adapter = res.adapter
      prepare = res.prepare
    })

    beforeEach(async () => {
      if (prepare) await prepare();
    })

    it('creates and reads a document', async () => {
      const createdRes: any = await adapter.createDocument({ collection, update: { username: 'test_user' } } as any)
      const created = createdRes && createdRes.data
      const id = created.id ?? created._id
      const fetchedRes: any = await adapter.getDocument({ collection, match: { _id: id } } as any)
      const fetched = fetchedRes && fetchedRes.data
      expect(fetched).toBeTruthy()
      expect(fetched.username).toBe('test_user')
    })

    it('updates a document', async () => {
      const createdRes: any = await adapter.createDocument({ collection, update: { username: 'test_user_1' } } as any)
      const created = createdRes && createdRes.data
      const id = created.id ?? created._id
      await adapter.updateDocument({ collection, match: { _id: id }, update: { username: 'updated_user' } } as any)
      const fetchedRes: any = await adapter.getDocument({ collection, match: { _id: id } } as any)
      const fetched = fetchedRes && fetchedRes.data
      expect(fetched).toBeTruthy()
      expect(fetched.username).toBe('updated_user')
    })

    it('deletes a document', async () => {
      const createdRes: any = await adapter.createDocument({ collection, update: { username: 'to-delete' } } as any)
      const created = createdRes && createdRes.data
      const id = created.id ?? created._id
      await adapter.deleteDocument({ collection, match: { _id: id } } as any)
      const fetchedRes: any = await adapter.getDocument({ collection, match: { _id: id } } as any)
      const fetched = fetchedRes && fetchedRes.data
      expect(fetched).toBeNull()
    })

    it('lists documents', async () => {
      await adapter.createDocument({ collection, update: { username: 'one' } } as any)
      await adapter.createDocument({ collection, update: { username: 'two' } } as any)
      const res: any = await adapter.getDocuments({ collection, match: {} })
      const docs = (res && res.data) || []
      expect(Array.isArray(docs)).toBe(true)
      expect(docs.length).toEqual(2)
    })
  })
}
