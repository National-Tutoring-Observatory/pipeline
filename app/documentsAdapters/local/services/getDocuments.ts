import fse from 'fs-extra';
import findOrCreateDocuments from '../helpers/findOrCreateDocuments';
import filter from 'lodash/filter';
import each from 'lodash/each';
import orderBy from 'lodash/orderBy';

export default async ({ collection, match, sort = {} }: { collection: string, match: {} | any, sort: {} }) => {

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