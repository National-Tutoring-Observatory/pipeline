import registerDocumentsAdapter from "~/core/documents/helpers/registerDocumentsAdapter";
import getDocuments from "./services/getDocuments";
import createDocument from "./services/createDocument";
import getDocument from "./services/getDocument";
import updateDocument from "./services/updateDocument";
import deleteDocument from "./services/deleteDocument";

registerDocumentsAdapter({
  name: 'LOCAL',
  getDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument
})