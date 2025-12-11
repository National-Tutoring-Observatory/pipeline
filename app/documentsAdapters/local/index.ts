import registerDocumentsAdapter from "~/modules/documents/helpers/registerDocumentsAdapter";
import withCollectionLock from "./helpers/withCollectionLock";
import countDocuments from "./services/countDocuments";
import createDocument from "./services/createDocument";
import deleteDocument from "./services/deleteDocument";
import deleteDocuments from "./services/deleteDocuments";
import getDocument from "./services/getDocument";
import getDocuments from "./services/getDocuments";
import updateDocument from "./services/updateDocument";

// Cast to DocumentAdapter to preserve the generic signatures on the adapter interface
registerDocumentsAdapter({
  name: 'LOCAL',
  getDocuments: withCollectionLock(getDocuments),
  countDocuments: withCollectionLock(countDocuments),
  createDocument: withCollectionLock(createDocument),
  getDocument: withCollectionLock(getDocument),
  updateDocument: withCollectionLock(updateDocument),
  deleteDocument: withCollectionLock(deleteDocument),
  deleteDocuments: withCollectionLock(deleteDocuments)
});
