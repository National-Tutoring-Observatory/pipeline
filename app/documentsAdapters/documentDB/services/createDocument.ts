
import mongoose from 'mongoose';
import type { CreateDocumentParams, CreateDocumentResult } from '~/modules/documents/documents.types';
import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

export default async function createDocument<T = any>({ collection, update }: CreateDocumentParams): Promise<CreateDocumentResult<T>> {

  try {

    await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = mongoose.models[model];

    const data = await Model.create(update);

    return {
      data: JSON.parse(JSON.stringify(data)) as T
    }

  } catch (error) {
    console.log(error);
    throw error;
  }

}
