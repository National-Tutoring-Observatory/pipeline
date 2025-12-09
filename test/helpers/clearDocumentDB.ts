import mongoose from 'mongoose'
import getDatabaseConnection from '~/documentsAdapters/documentDB/helpers/getDatabaseConnection'

export async function clearDocumentDB(disconnect = false): Promise<void> {
  // Ensure the adapter established a connection
  await getDatabaseConnection()

  // Use mongoose singleton to drop the currently selected database
  if (mongoose.connection && typeof mongoose.connection.dropDatabase === 'function') {
    await mongoose.connection.dropDatabase()
  }

  if (disconnect) {
    await mongoose.disconnect()
  }
}

export default clearDocumentDB
