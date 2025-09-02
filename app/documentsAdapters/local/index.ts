import registerDocumentsAdapter from "~/core/documents/helpers/registerDocumentsAdapter";
import getDocuments from "./services/getDocuments";

registerDocumentsAdapter({
  name: 'LOCAL',
  getDocuments
})