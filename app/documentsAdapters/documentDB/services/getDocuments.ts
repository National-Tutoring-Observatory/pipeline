import getDatabaseConnection from '../helpers/getDatabaseConnection';
import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';

export default async ({
  collection,
  match,
  sort = {},
  populate = [] }: {
    collection: string,
    match: {} | any,
    sort?: {};
    populate?: { path: string; select?: string }[]
  }) => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const count = await Model.countDocuments(match);

    const data = await Model.find(match).sort(sort).populate(populate);

    return {
      currentPage: 1,
      totalPages: 1,
      count,
      data: JSON.parse(JSON.stringify(data))
    }

  } catch (error) {
    console.log(error);
    return error;
  }

}