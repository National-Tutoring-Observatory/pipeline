import getDatabaseConnection from '../helpers/getDatabaseConnection';
import getModelFromCollection from '../helpers/getModelFromCollection';

export default async ({ collection, match }: { collection: string; match: any; }) => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const data = await Model.findById(match._id);

    return {
      data: data.toObject()
    }

  } catch (error) {
    console.log(error);
    return error;
  }

}