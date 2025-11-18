import fse from 'fs-extra';
import findDocumentByMatch from '../helpers/findDocumentByMatch';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';

export default async ({ collection, match }: { collection: string, match: any }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    let data = findDocumentByMatch(json, match);

    return {
      data
    }

  } catch (error) {
    return error;
  }

}
