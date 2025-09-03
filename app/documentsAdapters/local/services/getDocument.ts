import fse from 'fs-extra';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import find from 'lodash/find.js';

export default async ({ collection, match }: { collection: string, match: any }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    const returnedDocument = find(json, match);

    return {
      data: returnedDocument
    }

  } catch (error) {
    return error;
  }

}