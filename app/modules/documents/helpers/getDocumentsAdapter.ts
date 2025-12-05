import find from 'lodash/find';
import { DocumentAdapters } from './registerDocumentsAdapter';

export default (adapterName?: string) => {
  if (!adapterName) adapterName = process.env.DOCUMENTS_ADAPTER;

  let documents = find(DocumentAdapters, { name: adapterName });

  if (!documents) {
    console.warn('Documents is not registered so defaulting to local.');
    documents = find(DocumentAdapters, { name: 'LOCAL' });
  }

  return documents!;
}
