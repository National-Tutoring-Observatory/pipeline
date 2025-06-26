import fse from 'fs-extra';
import findOrCreateDocuments from './findOrCreateDocuments';
import filter from 'lodash/filter';

const COLLECTIONS = ['projects', 'runs'];

export default async ({ collection, match }: { collection: string, match: {} }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    const data = filter(json, match);

    return {
      currentPage: 1,
      totalPages: 1,
      count: data.length,
      data
    }

  } catch (error) {
    return error;
  }

}