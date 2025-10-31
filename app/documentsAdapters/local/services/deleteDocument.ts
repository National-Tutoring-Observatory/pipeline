import fse from 'fs-extra';
import remove from 'lodash/remove.js';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';

export default async ({ collection, match }: { collection: string, match: { _id: string } }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    const removedDocuments = remove(json, match);

    await fse.writeJson(`./data/${collection}.json`, json);

    return removedDocuments.length > 0;

  } catch (error) {
    return error;
  }

}
