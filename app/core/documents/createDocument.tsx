import fse from 'fs-extra';
import findOrCreateDocuments from './findOrCreateDocuments';
import getId from './getId';

const COLLECTIONS = ['projects', 'runs'];

export default async ({ collection, document }: { collection: string, document: { name: string } }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    const id = await getId();

    const newDocument = {
      _id: id,
      name: document.name,
      createdAt: new Date()
    }

    json.push(newDocument);

    await fse.writeJson(`./data/${collection}.json`, json);

    return {
      data: document
    }

  } catch (error) {
    return error;
  }

}