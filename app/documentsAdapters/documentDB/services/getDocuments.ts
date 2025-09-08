import getDatabaseConnection from '../helpers/getDatabaseConnection';
import getModelFromCollection from '../../../core/documents/helpers/getModelFromCollection';

export default async ({ collection, match, sort = {} }: { collection: string, match: {} | any, sort: {} }) => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const data = await Model.find({});

    return {
      currentPage: 1,
      totalPages: 1,
      count: data.length,
      data: JSON.parse(JSON.stringify(data))
    }

  } catch (error) {
    console.log(error);
    return error;
  }

}