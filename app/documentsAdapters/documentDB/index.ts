import registerDocumentsAdapter from "~/modules/documents/helpers/registerDocumentsAdapter";
import getDocuments from "./services/getDocuments";
import getDocument from "./services/getDocument";
import createDocument from "./services/createDocument";
import updateDocument from "./services/updateDocument";
import deleteDocument from "./services/deleteDocument";

// @ts-ignore
registerDocumentsAdapter({
  name: 'DOCUMENT_DB',
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument
});