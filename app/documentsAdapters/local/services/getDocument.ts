import fse from 'fs-extra';
import type { GetDocumentParams, GetDocumentResult } from '~/modules/documents/documents.types';
import findDocumentByMatch from '../helpers/findDocumentByMatch';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';

export default async function getDocument<T = any>({ collection, match }: GetDocumentParams): Promise<GetDocumentResult<T>> {
  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(getCollectionPath(collection));

    const data = findDocumentByMatch(json, match) as T | null;

    return {
      data: data || null
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error getting document from collection '${collection}'`);
  }
};
