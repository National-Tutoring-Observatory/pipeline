import type { StorageAdapter } from "../storage.types";
import find from 'lodash/find';

export const StorageAdapters: StorageAdapter[] = [];

export default ({ name, download, upload, remove, request }: StorageAdapter) => {
  if (find(StorageAdapters, { name })) {
    return console.warn(`"${name}" storage adapter already exists. Try using a new name.`);
  }
  StorageAdapters.push({ name, download, upload, remove, request });
}