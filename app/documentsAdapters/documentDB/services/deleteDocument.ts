import getDatabaseConnection from '../helpers/getDatabaseConnection';
import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';

export default async ({ collection, match }: { collection: string; match: any; }) => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    await Model.findByIdAndDelete(match._id);

    return {}

  } catch (error) {
    console.log(error);
    return error;
  }

}