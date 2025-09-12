import fse from 'fs-extra';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import find from 'lodash/find.js';
import extend from 'lodash/extend.js';
import validateDocument from '../helpers/validateDocument';

export default async ({ collection, match, update }: { collection: string, match: { _id: string }, update: {} }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    let returnedDocument = find(json, match);

    extend(returnedDocument, update);

    const document = await validateDocument({ collection, document: returnedDocument });

    await fse.writeJson(`./data/${collection}.json`, json);

    return {
      data: JSON.parse(JSON.stringify(document))
    }

  } catch (error) {
    return error;
  }

}