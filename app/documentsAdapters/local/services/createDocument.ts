import fse from 'fs-extra';
import findOrCreateDocuments from './findOrCreateDocuments';
import getId from './getId';

export default async ({ collection, update }: { collection: string, update: any }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    const id = await getId();

    const newDocument = {
      ...update,
      _id: id,
      createdAt: new Date(),
    }

    json.push(newDocument);

    await fse.writeJson(`./data/${collection}.json`, json);

    return {
      data: newDocument
    }

  } catch (error) {
    return error;
  }

}