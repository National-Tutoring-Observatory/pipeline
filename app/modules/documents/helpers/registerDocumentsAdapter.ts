import type { DocumentAdapter } from "../documents.types";
import find from 'lodash/find';
import remove from 'lodash/remove';

export const DocumentAdapters: DocumentAdapter[] = [];

export default ({ name, getDocuments, createDocument, getDocument, updateDocument, deleteDocument }: DocumentAdapter) => {
  if (find(DocumentAdapters, { name })) {
    remove(DocumentAdapters, { name });
  }
  DocumentAdapters.push({ name, getDocuments, createDocument, getDocument, updateDocument, deleteDocument });
}