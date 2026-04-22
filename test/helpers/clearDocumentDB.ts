import mongoose from "mongoose";

export default async function clearDocumentDB(): Promise<void> {
  if (!mongoose.connection.db) {
    return;
  }

  const collections = await mongoose.connection.db.listCollections().toArray();

  for (const { name } of collections) {
    if (name.startsWith("system.")) {
      continue;
    }

    await mongoose.connection.db.collection(name).deleteMany({});
  }
}
