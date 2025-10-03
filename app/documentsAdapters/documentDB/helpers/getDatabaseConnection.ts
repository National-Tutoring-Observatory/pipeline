import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs-extra';

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

  console.log(process.cwd());
  console.log(path.join(process.cwd(), 'global-bundle.pem'));

  const files = await fs.readdir(process.cwd());
  console.log(files);

  const connectionString = `mongodb://${encodeURIComponent(DOCUMENT_DB_USERNAME)}:${encodeURIComponent(DOCUMENT_DB_PASSWORD)}@${DOCUMENT_DB_CONNECTION_STRING}`;

  console.log(connectionString);

  if (!CONNECTION) {
    console.log('Database:connecting');
    const connection = await mongoose.connect(connectionString as string, {
      tls: true,
      tlsCAFile: path.join(process.cwd(), 'global-bundle.pem'),
      connectTimeoutMS: 10000,
    });
    CONNECTION = connection;
    mongoose.connection.on('error', err => {
      console.error('Mongoose connection error:', err);
    });
    console.log('Database:connected');
  }


  return CONNECTION;


}