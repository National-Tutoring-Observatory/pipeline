import type { CountDocumentsParams, CountDocumentsResult } from '~/modules/documents/documents.types';
import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

export default async ({ collection, match }: CountDocumentsParams): Promise<CountDocumentsResult> => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const count = await Model.countDocuments(match);

    return count;

  } catch (error) {
    console.log(error);
    throw error;
  }

}
