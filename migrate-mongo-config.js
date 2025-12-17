// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Use the same database configuration as the app
const {
  DOCUMENT_DB_CONNECTION_STRING,
  DOCUMENT_DB_USERNAME,
  DOCUMENT_DB_PASSWORD,
  DOCUMENT_DB_LOCAL
} = process.env;

// Require database configuration
if (!DOCUMENT_DB_CONNECTION_STRING) {
  throw new Error('DOCUMENT_DB_CONNECTION_STRING is required. Set it in your .env file.');
}

if (!DOCUMENT_DB_USERNAME) {
  throw new Error('DOCUMENT_DB_USERNAME is required. Set it in your .env file.');
}

if (!DOCUMENT_DB_PASSWORD) {
  throw new Error('DOCUMENT_DB_PASSWORD is required. Set it in your .env file.');
}

// Build connection URL using app's convention
const url = `mongodb://${encodeURIComponent(DOCUMENT_DB_USERNAME)}:${encodeURIComponent(DOCUMENT_DB_PASSWORD)}@${DOCUMENT_DB_CONNECTION_STRING}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  mongodb: {
    url: url,
    options: {
      connectTimeoutMS: 10000,
      // Add TLS for remote connections (AWS DocumentDB)
      ...(DOCUMENT_DB_CONNECTION_STRING && !DOCUMENT_DB_LOCAL && {
        tls: true,
        tlsCAFile: path.join(__dirname, 'global-bundle.pem')
      })
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The mongodb collection where the lock will be created.
  lockCollectionName: "changelog_lock",

  // The value in seconds for the TTL index that will be used for the lock. Value of 0 will disable the feature.
  lockTtl: 0,

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: 'esm',
};

export default config;
