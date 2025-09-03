import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DatabaseConnection {
  connection: mongoose.Connection;
}

let CONNECTION: DatabaseConnection | undefined;

const projectSchema = new mongoose.Schema({
  name: String,
});

if (!mongoose.models.Project) {
  mongoose.model('Project', projectSchema);
}
// Create a Mongoose Model from the schema

export default async () => {

  const { DOCUMENT_DB_CONNECTION_STRING } = process.env;


  if (!CONNECTION) {
    const connection = await mongoose.connect(DOCUMENT_DB_CONNECTION_STRING as string, {
      tls: true,
      tlsCAFile: "./global-bundle.pem",
      connectTimeoutMS: 10000,
    });
    CONNECTION = connection;
    console.log('connected');
  }


  return CONNECTION;


}