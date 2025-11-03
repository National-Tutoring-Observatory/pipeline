import fse from 'fs-extra';
import each from 'lodash/each';
import get from 'lodash/get';
import orderBy from 'lodash/orderBy';
import mongoose from 'mongoose';
import getCollectionFromModel from '~/modules/documents/helpers/getCollectionFromModel';
import getModelFromCollection from '~/modules/documents/helpers/getModelFromCollection';
import filterDocumentsByMatch from '../helpers/filterDocumentsByMatch';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import getDocument from './getDocument';

export default async ({
  collection,
  match,
  sort = {},
  populate = [],
  skip = 0,
  limit
}: {
  collection: string,
  match: {} | any,
  sort?: {};
  populate?: { path: string; select?: string }[];
  skip?: number;
  limit?: number;
}) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    let data = filterDocumentsByMatch(json, match);

    if (Object.keys(sort).length > 0) {
      const iteratees: string[] = [];
      const orders: Array<'asc' | 'desc'> = [];
      each(sort, (sortValue, sortKey) => {
        iteratees.push(sortKey);
        let sortOrder: 'asc' | 'desc' = sortValue === -1 ? 'desc' : 'asc';
        orders.push(sortOrder);
      });
      data = orderBy(data, iteratees, orders);
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
              const refData = await getDocument({ collection, match: { _id: model[populateItem.path] } }) as { data: any };

              if (refData && refData.data) {
                model[populateItem.path] = refData.data;
              }
            }
          }
        }
      }
    }

    const totalCount = data.length;

    // Apply pagination if limit is specified
    if (limit !== undefined) {
      data = data.slice(skip, skip + limit);
    }

    return {
      currentPage: limit ? Math.floor(skip / limit) + 1 : 1,
      totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      count: totalCount,
      data
    }

  } catch (error) {
    return error;
  }

}
