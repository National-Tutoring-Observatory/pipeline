import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

export default async ({ collection, match }: { collection: string; match: any; }) => {
  try {
    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    await Model.findByIdAndDelete(match._id);

    return true;
  } catch (error) {
    console.error(error);
    throw new Error(`Error deleting document from collection '${collection}'`);
  }
};
