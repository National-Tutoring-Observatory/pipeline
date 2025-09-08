import fse from 'fs-extra';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getId from '../helpers/getId';
import validateDocument from '../helpers/validateDocument';

export default async ({ collection, update }: { collection: string, update: any }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    const document = await validateDocument({ collection, document: update });

    json.push(document);

    await fse.writeJson(`./data/${collection}.json`, json);

    return {
      data: JSON.parse(JSON.stringify(document))
    }

  } catch (error) {
    console.log(error);
    return error;
  }

}