import mongoose from 'mongoose';
import path from 'path';

interface DatabaseConnection {
  connection: mongoose.Connection;
  models: mongoose.Models;
}

let CONNECTION: DatabaseConnection | undefined;

export default async () => {

  const {
    DOCUMENT_DB_CONNECTION_STRING,
    DOCUMENT_DB_USERNAME,
    DOCUMENT_DB_PASSWORD,
    DOCUMENT_DB_LOCAL
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

  const connectionString = `mongodb://${encodeURIComponent(DOCUMENT_DB_USERNAME)}:${encodeURIComponent(DOCUMENT_DB_PASSWORD)}@${DOCUMENT_DB_CONNECTION_STRING}`;

  if (!CONNECTION) {
    const connectionOptions: any = {
      connectTimeoutMS: 10000,
    };

    // Add TLS options only for remote connections (AWS DocumentDB)
    const isLocalConnection = DOCUMENT_DB_LOCAL === 'true' ||
      DOCUMENT_DB_CONNECTION_STRING.includes('localhost') ||
      DOCUMENT_DB_CONNECTION_STRING.includes('127.0.0.1');

    if (!isLocalConnection) {
      connectionOptions.tls = true;
      connectionOptions.tlsCAFile = path.join(process.cwd(), 'global-bundle.pem');
    }

    const connection = await mongoose.connect(connectionString, connectionOptions);
    CONNECTION = connection;
    mongoose.connection.on('error', err => {
      console.error('Mongoose connection error:', err);
    });
  }


  return CONNECTION;


}
