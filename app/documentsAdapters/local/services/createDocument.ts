import fse from 'fs-extra';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';
import validateDocument from '../helpers/validateDocument';

export default async ({ collection, update }: { collection: string, update: any }): Promise<{ data: any }> => {
  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    const document = await validateDocument({ collection, document: update });

    json.push(document);

    await fse.writeJson(getCollectionPath(collection), json);

    return {
      data: JSON.parse(JSON.stringify(document))
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error creating document in collection '${collection}'`);
  }
};
