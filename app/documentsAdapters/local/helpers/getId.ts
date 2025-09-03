import fse from 'fs-extra';
import findOrCreateDocuments from './findOrCreateDocuments';
import mongoose from 'mongoose';

export default async () => {

  const id = new mongoose.Types.ObjectId();

  return id.toString();

}