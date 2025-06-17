import fse from 'fs-extra';
import remove from 'lodash/remove.js';
import findOrCreateDocuments from './findOrCreateDocuments';

const COLLECTIONS = ['projects', 'runs'];

export default async ({ collection, document }: { collection: string, document: { _id: number } }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    remove(json, { _id: document._id });

    await fse.writeJson(`./data/${collection}.json`, json);

    return {}

  } catch (error) {
    return error;
  }

}