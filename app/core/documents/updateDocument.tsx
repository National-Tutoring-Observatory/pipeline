import fse from 'fs-extra';
import findOrCreateDocuments from './findOrCreateDocuments';
import find from 'lodash/find.js';
import extend from 'lodash/extend.js';

const COLLECTIONS = ['projects', 'runs'];

export default async ({ collection, document, update }: { collection: string, document: { _id: number }, update: {} }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    let returnedDocument = find(json, { _id: document._id });

    extend(returnedDocument, update);

    await fse.writeJson(`./data/${collection}.json`, json);

    return {
      data: returnedDocument
    }

  } catch (error) {
    return error;
  }

}