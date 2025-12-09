import getDatabaseConnection from '~/documentsAdapters/documentDB/helpers/getDatabaseConnection'

export default async function clearDocumentDB(): Promise<void> {
  const connection = await getDatabaseConnection()
  await connection.connection.dropDatabase()
}
