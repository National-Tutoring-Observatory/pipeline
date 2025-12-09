import { rm, mkdir } from 'fs/promises';
import getDocumentsAdapter from '../helpers/getDocumentsAdapter';
import { runDocumentAdapterTests } from './documentAdapterSuite';
import { DATA_PATH } from '~/helpers/projectRoot';

runDocumentAdapterTests(async () => {
  const adapter: any = getDocumentsAdapter('LOCAL')

  return {
    adapter,
    prepare: async () => {
      await rm(DATA_PATH, { recursive: true, force: true })
      await mkdir(DATA_PATH, { recursive: true });
    }
  }
})
