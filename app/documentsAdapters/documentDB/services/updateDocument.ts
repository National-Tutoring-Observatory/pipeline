import type { UpdateDocumentParams, UpdateDocumentResult } from '~/modules/documents/documents.types';
import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

export default async function updateDocument<T = any>({ collection, match, update }: UpdateDocumentParams): Promise<UpdateDocumentResult<T>> {
  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    const data = await Model.findByIdAndUpdate(match._id, update, { new: true });

    return {
      data: JSON.parse(JSON.stringify(data)) as T
    }

  } catch (error) {
    console.log(error);
    throw error;
  }

}
