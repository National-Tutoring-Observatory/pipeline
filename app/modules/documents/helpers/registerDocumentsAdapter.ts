import find from 'lodash/find';
import remove from 'lodash/remove';
import type { DocumentAdapter } from "../documents.types";

export const DocumentAdapters: DocumentAdapter[] = [];

export default ({ name, getDocuments, countDocuments, createDocument, getDocument, updateDocument, deleteDocument, deleteDocuments }: DocumentAdapter) => {
  if (find(DocumentAdapters, { name })) {
    remove(DocumentAdapters, { name });
  }
  DocumentAdapters.push({ name, getDocuments, countDocuments, createDocument, getDocument, updateDocument, deleteDocument, deleteDocuments });
}
