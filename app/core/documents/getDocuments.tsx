import fse from 'fs-extra';
import includes from 'lodash/includes.js';

const COLLECTIONS = ['projects', 'runs'];

export default async ({ collection }: { collection: string }) => {

  try {
    if (!includes(COLLECTIONS, collection)) throw { message: 'This collection does not exist', statusCode: 400 };

    const collectionExists = await fse.pathExists(`./data/${collection}.json`);
    if (!collectionExists) {
      await fse.writeJson(`./data/${collection}.json`, []);
    }

    const json = await fse.readJson(`./data/${collection}.json`);

    return {
      currentPage: 1,
      totalPages: 1,
      count: json.length,
      data: json
    }

  } catch (error) {
    return error;
  }

}