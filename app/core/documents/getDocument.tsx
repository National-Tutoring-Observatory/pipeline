import fse from 'fs-extra';
import findOrCreateDocuments from './findOrCreateDocuments';
import find from 'lodash/find.js';

const COLLECTIONS = ['projects', 'runs'];

export default async ({ collection, document }: { collection: string, document: { _id: number } }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    const returnedDocument = find(json, { _id: document._id });

    return {
      data: returnedDocument
    }

  } catch (error) {
    return error;
  }

}