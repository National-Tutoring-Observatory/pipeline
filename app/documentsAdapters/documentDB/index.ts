import registerDocumentsAdapter from "~/core/documents/helpers/registerDocumentsAdapter";
import getDocuments from "./services/getDocuments";

// @ts-ignore
registerDocumentsAdapter({
  name: 'DOCUMENT_DB',
  getDocuments
});