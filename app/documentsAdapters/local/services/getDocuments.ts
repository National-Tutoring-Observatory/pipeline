import fse from 'fs-extra';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import filter from 'lodash/filter';
import each from 'lodash/each';
import get from 'lodash/get';
import orderBy from 'lodash/orderBy';
import mongoose from 'mongoose';
import getModelFromCollection from '~/modules/documents/helpers/getModelFromCollection';
import getCollectionFromModel from '~/modules/documents/helpers/getCollectionFromModel';
import getDocument from './getDocument';

export default async ({
  collection,
  match,
  sort = {},
  populate = []
}: {
  collection: string,
  match: {} | any,
  sort?: {};
  populate?: { path: string; select?: string }[]
}) => {

  try {
    await findOrCreateDocuments({ collection });

    const json = await fse.readJson(`./data/${collection}.json`);

    let data = filter(json, match);
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

    return {
      currentPage: 1,
      totalPages: 1,
      count: data.length,
      data
    }

  } catch (error) {
    return error;
  }

}