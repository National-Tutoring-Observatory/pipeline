import { DocumentAdapters } from './registerDocumentsAdapter';
import find from 'lodash/find';

export default () => {
  let documents = find(DocumentAdapters, { name: process.env.DOCUMENTS_ADAPTER })
  if (!documents) {
    console.warn("Documents is not registered so defaulting to local.");
    documents = find(DocumentAdapters, { name: 'LOCAL' });
  }
  return documents!;
}