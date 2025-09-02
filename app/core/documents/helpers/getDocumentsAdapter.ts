import { DocumentAdapters } from './registerDocumentsAdapter';
import find from 'lodash/find';

export default () => {
  let storage = find(DocumentAdapters, { name: process.env.DOCUMENTS_ADAPTER });
  if (!storage) {
    console.warn("Documents is not registered so defaulting to local.");
    storage = find(DocumentAdapters, { name: 'LOCAL' });
  }
  return storage;
}