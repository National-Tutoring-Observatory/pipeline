import mongoose from 'mongoose';

interface DatabaseConnection {
  connection: mongoose.Connection;
  models: mongoose.Models;
}

let CONNECTION: DatabaseConnection | undefined;

export default async () => {

  const {
    DOCUMENT_DB_CONNECTION_STRING,
    DOCUMENT_DB_USERNAME,
    DOCUMENT_DB_PASSWORD
  } = process.env;

  if (!DOCUMENT_DB_CONNECTION_STRING) {
    throw new Error('DOCUMENT_DB_CONNECTION_STRING is undefined.');
  }

  if (!DOCUMENT_DB_USERNAME) {
    throw new Error('DOCUMENT_DB_USERNAME is undefined.');
  }

  if (!DOCUMENT_DB_PASSWORD) {
    throw new Error('DOCUMENT_DB_PASSWORD is undefined.');
  }

  const connectionString = DOCUMENT_DB_CONNECTION_STRING
    .replace('{{username}}', encodeURIComponent(DOCUMENT_DB_USERNAME))
    .replace('{{password}}', encodeURIComponent(DOCUMENT_DB_PASSWORD));

  if (!CONNECTION) {
    console.log('Database:connecting');
    const connection = await mongoose.connect(connectionString as string, {
      tls: true,
      tlsCAFile: "./global-bundle.pem",
      connectTimeoutMS: 10000,
    });
    CONNECTION = connection;
    console.log('Database:connected');
  }


  return CONNECTION;


}