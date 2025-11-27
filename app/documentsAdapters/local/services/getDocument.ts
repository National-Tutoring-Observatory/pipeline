import fse from 'fs-extra';
import findDocumentByMatch from '../helpers/findDocumentByMatch';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';

export default async ({ collection, match }: { collection: string, match: any }): Promise<{ data: any | null }> => {
  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    const data = findDocumentByMatch(json, match);

    return {
      data
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error getting document from collection '${collection}'`);
  }
};
