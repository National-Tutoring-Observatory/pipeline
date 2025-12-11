import fse from 'fs-extra';
import remove from 'lodash/remove.js';
import filterDocumentsByMatch from '../helpers/filterDocumentsByMatch';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';

export default async ({ collection, match }: { collection: string, match: any }): Promise<number> => {
  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    const matchingDocuments = filterDocumentsByMatch(json, match);

    const idsToDelete = new Set(matchingDocuments.map((doc: any) => doc._id));

    const removedDocuments = remove(json, (doc: any) => idsToDelete.has(doc._id));

    await fse.writeJson(getCollectionPath(collection), json);

    return removedDocuments.length;
  } catch (error) {
    console.error(error);
    throw new Error(`Error deleting documents from collection '${collection}'`);
  }
};
