import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

export default async ({
  collection,
  match,
}: {
  collection: string,
  match: {} | any,
}) => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const count = await Model.countDocuments(match);

    return count;

  } catch (error) {
    console.log(error);
    return error;
  }

}
