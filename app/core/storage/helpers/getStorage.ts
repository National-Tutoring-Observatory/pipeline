import { StorageAdapters } from './registerStorage';
import find from 'lodash/find';

export default () => {
  let storage = find(StorageAdapters, { name: process.env.STORAGE_ADAPTER });
  if (!storage) {
    console.warn("Storage is not registered so defaulting to local.");
    storage = find(StorageAdapters, { name: 'LOCAL' });
  }
  return storage;
}