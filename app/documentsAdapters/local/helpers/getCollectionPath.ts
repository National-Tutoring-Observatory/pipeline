import path from 'path';
import { PROJECT_ROOT } from '~/helpers/projectRoot';

/**
 * Returns the absolute path to a collection's JSON file in the data directory.
 * @param collection The collection name (e.g., 'users', 'projects')
 */
export default function (collection: string): string {
  return path.join(PROJECT_ROOT, 'data', `${collection}.json`);
}
