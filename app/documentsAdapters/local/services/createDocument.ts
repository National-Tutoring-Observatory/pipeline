import fse from 'fs-extra';
import type { CreateDocumentParams, CreateDocumentResult } from '~/modules/documents/documents.types';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';
import validateDocument from '../helpers/validateDocument';

export default async function createDocument<T = any>({ collection, update }: CreateDocumentParams): Promise<CreateDocumentResult<T>> {
  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    const document = await validateDocument({ collection, document: update });

    json.push(document);

    await fse.writeJson(getCollectionPath(collection), json);

    return {
      data: JSON.parse(JSON.stringify(document)) as T
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error creating document in collection '${collection}'`);
  }
}
