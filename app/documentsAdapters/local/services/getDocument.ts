import fse from 'fs-extra';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import find from 'lodash/find.js';
import filterDocumentsByMatch from '../helpers/filterDocumentsByMatch';
import findDocumentByMatch from '../helpers/findDocumentByMatch';

export default async ({ collection, match }: { collection: string, match: any }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    let data = findDocumentByMatch(json, match);

    return {
      data
    }

  } catch (error) {
    return error;
  }

}