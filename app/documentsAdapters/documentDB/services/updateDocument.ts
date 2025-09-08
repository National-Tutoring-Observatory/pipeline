import getDatabaseConnection from '../helpers/getDatabaseConnection';
import getModelFromCollection from '../../../core/documents/helpers/getModelFromCollection';

export default async ({ collection, match, update }: { collection: string, match: { _id: string }, update: {} }) => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const data = await Model.findByIdAndUpdate(match._id, update);

    return {
      data: JSON.parse(JSON.stringify(data))
    }

  } catch (error) {
    console.log(error);
    return error;
  }

}