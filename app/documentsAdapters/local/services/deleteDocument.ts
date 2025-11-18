import fse from 'fs-extra';
import remove from 'lodash/remove.js';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';

export default async ({ collection, match }: { collection: string, match: { _id: string } }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    const removedDocuments = remove(json, match);

    await fse.writeJson(getCollectionPath(collection), json);

    return removedDocuments.length > 0;

  } catch (error) {
    return error;
  }

}
