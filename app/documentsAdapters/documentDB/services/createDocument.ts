import getDatabaseConnection from '../helpers/getDatabaseConnection';
import getModelFromCollection from '../../../core/documents/helpers/getModelFromCollection';

export default async ({ collection, update }: { collection: string; update: any; }) => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const data = await Model.create(update);

    return {
      data: JSON.parse(JSON.stringify(data))
    }

  } catch (error) {
    console.log(error);
    return error;
  }

}