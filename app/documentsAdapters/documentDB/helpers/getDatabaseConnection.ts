import mongoose from 'mongoose';

interface DatabaseConnection {
  connection: mongoose.Connection;
  models: mongoose.Models;
}

let CONNECTION: DatabaseConnection | undefined;

const projectSchema = new mongoose.Schema({
  name: String,
});

if (!mongoose.models.Project) {
  mongoose.model('Project', projectSchema);
}

export default async () => {

  const { DOCUMENT_DB_CONNECTION_STRING } = process.env;


  if (!CONNECTION) {
    console.log('Database:connecting');
    const connection = await mongoose.connect(DOCUMENT_DB_CONNECTION_STRING as string, {
      tls: true,
      tlsCAFile: "./global-bundle.pem",
      connectTimeoutMS: 10000,
    });
    CONNECTION = connection;
    console.log('Database:connected');
  }


  return CONNECTION;


}