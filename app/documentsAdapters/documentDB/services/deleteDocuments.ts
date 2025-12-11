import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

export default async ({ collection, match }: { collection: string; match: any; }) => {
  try {
    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const result = await Model.deleteMany(match);

    return result.deletedCount;
  } catch (error) {
    console.error(error);
    throw new Error(`Error deleting documents from collection '${collection}'`);
  }
};
