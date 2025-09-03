import getDatabaseConnection from '../helpers/getDatabaseConnection';
import getModelFromCollection from '../helpers/getModelFromCollection';

export default async ({ collection, match, sort = {} }: { collection: string, match: {} | any, sort: {} }) => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const data = await Model.find({});

    console.log(data);

    return {
      currentPage: 1,
      totalPages: 1,
      count: data.length,
      data
    }

  } catch (error) {
    console.log(error);
    return error;
  }

}