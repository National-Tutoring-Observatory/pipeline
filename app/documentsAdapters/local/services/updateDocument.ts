import fse from 'fs-extra';
import extend from 'lodash/extend.js';
import find from 'lodash/find.js';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';
import validateDocument from '../helpers/validateDocument';
import type { UpdateDocumentParams, UpdateDocumentResult } from '~/modules/documents/documents.types';

export default async function updateDocument<T = any>({ collection, match, update }: UpdateDocumentParams): Promise<UpdateDocumentResult<T>> {
  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    let returnedDocument = find(json, match);

    extend(returnedDocument, update);

    const document = await validateDocument({ collection, document: returnedDocument });

    await fse.writeJson(getCollectionPath(collection), json);

    return {
      data: JSON.parse(JSON.stringify(document)) as T
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error updating document in collection '${collection}'`);
  }
};
