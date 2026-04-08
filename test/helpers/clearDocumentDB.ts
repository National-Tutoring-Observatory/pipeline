import mongoose from "mongoose";

export default async function clearDocumentDB(): Promise<void> {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((col) => col.deleteMany({})));
}
