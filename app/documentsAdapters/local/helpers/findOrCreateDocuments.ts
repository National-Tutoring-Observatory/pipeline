import fse from 'fs-extra';
import includes from 'lodash/includes.js';

const COLLECTIONS = ['teams', 'users', 'prompts', 'promptVersions', 'projects', 'files', 'sessions', 'runs', 'collections', 'jobs', 'featureFlags'];

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
  featureFlags: []
}

export default async ({ collection }: { collection: string }) => {

  if (!includes(COLLECTIONS, collection)) throw { message: 'This collection does not exist', statusCode: 400 };

  const collectionExists = await fse.pathExists(`./data/${collection}.json`);
  if (!collectionExists) {
    // @ts-ignore
    await fse.writeJson(`./data/${collection}.json`, DEFAULTS[collection] || []);
  }

}
