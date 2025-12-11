import clearDocumentDB from 'test/helpers/clearDocumentDB';
import getDocumentsAdapter from '../helpers/getDocumentsAdapter';
import { runDocumentAdapterTests } from './documentAdapterSuite';

runDocumentAdapterTests(async () => {
  const adapter: any = getDocumentsAdapter('DOCUMENT_DB')

  return {
    adapter,
    prepare: async () => {
      await clearDocumentDB()
    }
  }
})
