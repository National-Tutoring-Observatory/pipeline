import registerDocumentsAdapter from "~/core/documents/helpers/registerDocumentsAdapter";
import getDocuments from "./services/getDocuments";
import getDocument from "./services/getDocument";

// @ts-ignore
registerDocumentsAdapter({
  name: 'DOCUMENT_DB',
  getDocuments,
  getDocument
});