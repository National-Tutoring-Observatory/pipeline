import mongoose from "mongoose";
import getModelFromCollection from "~/modules/documents/helpers/getModelFromCollection";

export default async ({ collection, document }: { collection: string, document: any }) => {
  const modelKey = getModelFromCollection(collection);
  const Model = mongoose.models[modelKey];

  const documentModel = new Model(document);

  await documentModel.validate();

  return documentModel;
}