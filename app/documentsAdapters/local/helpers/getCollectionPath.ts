import path from 'path';
import { DATA_PATH } from '~/helpers/projectRoot';

/**
 * Returns the absolute path to a collection's JSON file in the data directory.
 * @param collection The collection name (e.g., 'users', 'projects')
 */
export default function (collection: string): string {
  return path.join(DATA_PATH, `${collection}.json`);
}
