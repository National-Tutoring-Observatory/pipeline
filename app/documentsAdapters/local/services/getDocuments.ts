import fse from 'fs-extra';
import get from 'lodash/get';
import mongoose from 'mongoose';
import type { GetDocumentsParams, GetDocumentsResult } from '~/modules/documents/documents.types';
import getCollectionFromModel from '~/modules/documents/helpers/getCollectionFromModel';
import getModelFromCollection from '~/modules/documents/helpers/getModelFromCollection';
import applySortToDocuments from '../helpers/applySortToDocuments';
import filterDocumentsByMatch from '../helpers/filterDocumentsByMatch';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getCollectionPath from '../helpers/getCollectionPath';
import getDocument from './getDocument';

const DEFAULT_PAGE_SIZE = 50;

export default async function getDocuments<T = any>({
  collection,
  match,
  sort = {},
  populate = [],
  page,
  pageSize
}: GetDocumentsParams): Promise<GetDocumentsResult<T>> {

  try {
    await findOrCreateDocuments({ collection });
    const json = await fse.readJson(getCollectionPath(collection));

    let data = filterDocumentsByMatch(json, match);

    data = applySortToDocuments(data, sort);

    const count = data.length;
    let currentPage = 1;
    let totalPages = 1;

    if (page !== undefined) {
      const parsedPage = parseInt(String(page), 10);
      if (isNaN(parsedPage) || !Number.isInteger(parsedPage) || parsedPage < 1) {
        throw new Error(`Invalid page number: ${page}`);
      }

      const parsedPageSize = pageSize !== undefined ? parseInt(String(pageSize), 10) : DEFAULT_PAGE_SIZE;
      if (isNaN(parsedPageSize) || !Number.isInteger(parsedPageSize) || parsedPageSize < 1) {
        throw new Error(`Invalid page size: ${pageSize}`);
      }

      currentPage = parsedPage;
      totalPages = Math.max(1, Math.ceil(count / parsedPageSize));
      const skip = (parsedPage - 1) * parsedPageSize;
      data = data.slice(skip, skip + parsedPageSize) as any[];
    }

    if (populate.length > 0) {
      const modelKey = getModelFromCollection(collection);
      const Model = mongoose.models[modelKey];

      const schema = Model.schema.obj;
      for (const model of data as any[]) {

        for (const populateItem of populate) {

          const refModel = get(schema, `${populateItem.path}.ref`, null);
          if (refModel) {
            // @ts-ignore
            const collection = getCollectionFromModel(refModel);

            if (collection) {
              const refData = await getDocument<any>({ collection, match: { _id: model[populateItem.path] } });

              if (refData && refData.data) {
                model[populateItem.path] = refData.data;
              }
            }
          }
        }
      }
    }

    return {
      currentPage: currentPage,
      totalPages: totalPages,
      count: count,
      data: data as unknown as T[]
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
