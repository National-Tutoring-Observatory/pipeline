import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
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

    it('deletes multiple documents by filter', async () => {
      // Create documents with different field values
      const alice: any = await adapter.createDocument({ collection, update: { username: 'alice', isRegistered: true } } as any)
      const bob: any = await adapter.createDocument({ collection, update: { username: 'bob', isRegistered: true } } as any)
      const charlie: any = await adapter.createDocument({ collection, update: { username: 'charlie', isRegistered: false } } as any)

      // Verify all 3 documents exist
      const beforeDelete: any = await adapter.getDocuments({ collection, match: {} })
      const docsBefore = (beforeDelete && beforeDelete.data) || []
      expect(docsBefore.length).toEqual(3)

      // Delete all registered documents
      const deletedCount: number = await adapter.deleteDocuments({ collection, match: { isRegistered: true } } as any)
      expect(deletedCount).toBe(2)

      // Verify only unregistered document remains
      const afterDelete: any = await adapter.getDocuments({ collection, match: {} })
      const docsAfter = (afterDelete && afterDelete.data) || []
      expect(docsAfter.length).toEqual(1)
      expect(docsAfter[0].username).toBe('charlie')
      expect(docsAfter[0].isRegistered).toBe(false)
    })

    it('deletes all documents in collection', async () => {
      await adapter.createDocument({ collection, update: { username: 'user1' } } as any)
      await adapter.createDocument({ collection, update: { username: 'user2' } } as any)
      await adapter.createDocument({ collection, update: { username: 'user3' } } as any)

      // Delete all documents
      const deletedCount: number = await adapter.deleteDocuments({ collection, match: {} } as any)
      expect(deletedCount).toBe(3)

      // Verify collection is empty
      const res: any = await adapter.getDocuments({ collection, match: {} })
      const docs = (res && res.data) || []
      expect(docs.length).toEqual(0)
    })

    it('returns 0 when deleting with no matches', async () => {
      await adapter.createDocument({ collection, update: { username: 'user1' } } as any)

      // Try to delete non-existent documents
      const deletedCount: number = await adapter.deleteDocuments({ collection, match: { username: 'nonexistent' } } as any)
      expect(deletedCount).toBe(0)

      // Verify original document still exists
      const res: any = await adapter.getDocuments({ collection, match: {} })
      const docs = (res && res.data) || []
      expect(docs.length).toEqual(1)
    })

    it('deletes documents with complex query operators', async () => {
      // Create documents with different registration statuses
      await adapter.createDocument({ collection, update: { username: 'alice', isRegistered: true } } as any)
      await adapter.createDocument({ collection, update: { username: 'bob', isRegistered: true } } as any)
      await adapter.createDocument({ collection, update: { username: 'charlie', isRegistered: false } } as any)
      await adapter.createDocument({ collection, update: { username: 'diana', isRegistered: false } } as any)

      // Delete all NOT registered (using $ne operator)
      const deletedCount: number = await adapter.deleteDocuments({ collection, match: { isRegistered: { $ne: true } } } as any)
      expect(deletedCount).toBe(2)

      // Verify only registered documents remain
      const res: any = await adapter.getDocuments({ collection, match: {} })
      const docs = (res && res.data) || []
      expect(docs.length).toEqual(2)
      expect(docs.every((doc: any) => doc.isRegistered === true)).toBe(true)
    })
  })
}
