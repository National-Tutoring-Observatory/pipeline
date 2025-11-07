import registerDocumentsAdapter from "~/modules/documents/helpers/registerDocumentsAdapter";
import countDocuments from "./services/countDocuments";
import createDocument from "./services/createDocument";
import deleteDocument from "./services/deleteDocument";
import getDocument from "./services/getDocument";
import getDocuments from "./services/getDocuments";
import updateDocument from "./services/updateDocument";

// @ts-ignore
registerDocumentsAdapter({
  name: 'DOCUMENT_DB',
  getDocuments,
  countDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument
});
