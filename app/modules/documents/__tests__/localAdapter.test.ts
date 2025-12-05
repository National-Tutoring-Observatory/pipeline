import { rm } from 'fs/promises';
import '../documents';
import getDocumentsAdapter from '../helpers/getDocumentsAdapter';
import { runDocumentAdapterTests } from './documentAdapterSuite';
import { DATA_PATH } from '~/helpers/projectRoot';

runDocumentAdapterTests(async () => {
  const adapter: any = getDocumentsAdapter('LOCAL')

  return {
    adapter,
    teardown: async () => {
      try {
        await rm(DATA_PATH, { recursive: true, force: true })
      } catch (e) {
        // ignore
      }
    },
  }
})
