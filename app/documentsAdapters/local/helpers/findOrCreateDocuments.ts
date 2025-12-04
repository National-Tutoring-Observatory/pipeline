
import fse from 'fs-extra';
import includes from 'lodash/includes.js';
import getCollectionPath from './getCollectionPath';


const COLLECTIONS = ['teams', 'users', 'prompts', 'promptVersions', 'projects', 'files', 'sessions', 'runs', 'collections', 'jobs', 'featureFlags', 'audits'];


const DEFAULTS = {
  teams: [],
  users: [],
  prompts: [],
  promptVersions: [],
  projects: [],
  runs: [],
  collections: [],
  files: [],
  sessions: [],
  jobs: [],
  featureFlags: [],
  audits: [],
};


export default async ({ collection }: { collection: string }) => {
  if (!includes(COLLECTIONS, collection)) throw { message: 'This collection does not exist', statusCode: 400 };

  const collectionPath = getCollectionPath(collection);
  const collectionExists = await fse.pathExists(collectionPath);
  if (!collectionExists) {
    // @ts-ignore
    await fse.writeJson(collectionPath, DEFAULTS[collection] || []);
  }
};
