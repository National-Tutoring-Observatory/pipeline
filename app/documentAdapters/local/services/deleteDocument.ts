import fse from 'fs-extra';
import remove from 'lodash/remove.js';
import findOrCreateDocuments from './findOrCreateDocuments';

export default async ({ collection, match }: { collection: string, match: { _id: number } }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    remove(json, match);

    await fse.writeJson(`./data/${collection}.json`, json);

    return {}

  } catch (error) {
    return error;
  }

}