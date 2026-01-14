import mongoose from 'mongoose'

export default async function clearDocumentDB(): Promise<void> {
  await mongoose.connection.dropDatabase()
}
