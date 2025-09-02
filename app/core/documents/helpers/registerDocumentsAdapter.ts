import type { DocumentAdapter } from "../documents.types";
import find from 'lodash/find';

export const DocumentAdapters: DocumentAdapter[] = [];

export default ({ name, getDocuments }: DocumentAdapter) => {
  if (find(DocumentAdapters, { name })) {
    return console.warn(`"${name}" document adapter already exists. Try using a new name.`);
  }
  DocumentAdapters.push({ name, getDocuments });
}