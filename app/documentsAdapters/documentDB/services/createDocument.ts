
import type { CreateDocumentParams, CreateDocumentResult } from '~/modules/documents/documents.types';
import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

export default async ({ collection, update }: CreateDocumentParams): Promise<CreateDocumentResult> => {

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
    throw error;
  }

}
