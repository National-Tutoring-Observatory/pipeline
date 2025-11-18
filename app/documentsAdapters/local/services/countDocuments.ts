import fse from 'fs-extra';
import filterDocumentsByMatch from '../helpers/filterDocumentsByMatch';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';

export default async ({
  collection,
  match,
}: {
  collection: string,
  match: {} | any,
}) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    let data = filterDocumentsByMatch(json, match);

    return data.length;

  } catch (error) {
    return error;
  }

}
