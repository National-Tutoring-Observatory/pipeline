import mongoose from 'mongoose';
import type { GetDocumentParams, GetDocumentResult } from '~/modules/documents/documents.types';
import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

export default async ({ collection, match }: GetDocumentParams): Promise<GetDocumentResult> => {

  try {

    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    let data;

    const matchKeys = Object.keys(match);

    if (matchKeys.length === 1 && matchKeys[0] === '_id' && mongoose.Types.ObjectId.isValid(match._id)) {
      data = await Model.findById(match._id);
    } else {
      data = await Model.findOne(match);
    }

    return {
      data: JSON.parse(JSON.stringify(data))
    }

  } catch (error) {
    console.log(error);
    throw error;
  }

}
