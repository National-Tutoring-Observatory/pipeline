import mongoose from 'mongoose';

export default async () => {

  const id = new mongoose.Types.ObjectId();

  return id.toString();

}