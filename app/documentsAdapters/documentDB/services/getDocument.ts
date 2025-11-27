import mongoose from 'mongoose';
import type { GetDocumentParams, GetDocumentResult } from '~/modules/documents/documents.types';
import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

export default async function getDocument<T = any>({ collection, match }: GetDocumentParams): Promise<GetDocumentResult<T>> {
  try {
    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    let data: any = null;

    const matchKeys = Object.keys(match);

    if (matchKeys.length === 1 && matchKeys[0] === '_id' && mongoose.Types.ObjectId.isValid(match._id)) {
      data = await Model.findById(match._id);
    } else {
      data = await Model.findOne(match);
    }

    const serialized = JSON.parse(JSON.stringify(data));
    return { data: serialized as T };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
