import registerDocumentsAdapter from "~/core/documents/helpers/registerDocumentsAdapter";
import getDocuments from "./services/getDocuments";
import getDocument from "./services/getDocument";
import createDocument from "./services/createDocument";
import updateDocument from "./services/updateDocument";

// @ts-ignore
registerDocumentsAdapter({
  name: 'DOCUMENT_DB',
  getDocuments,
  getDocument,
  createDocument,
  updateDocument
});