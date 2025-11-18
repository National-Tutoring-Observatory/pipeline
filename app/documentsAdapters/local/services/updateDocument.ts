import fse from 'fs-extra';
import extend from 'lodash/extend.js';
import find from 'lodash/find.js';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';
import validateDocument from '../helpers/validateDocument';

export default async ({ collection, match, update }: { collection: string, match: { _id: string }, update: {} }) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    let returnedDocument = find(json, match);

    extend(returnedDocument, update);

    const document = await validateDocument({ collection, document: returnedDocument });

    await fse.writeJson(getCollectionPath(collection), json);

    return {
      data: JSON.parse(JSON.stringify(document))
    }

  } catch (error) {
    return error;
  }

}
