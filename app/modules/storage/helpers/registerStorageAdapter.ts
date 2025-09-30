import type { StorageAdapter } from "../storage.types";
import find from 'lodash/find';
import _remove from 'lodash/remove';

export const StorageAdapters: StorageAdapter[] = [];

export default ({ name, download, upload, remove, request }: StorageAdapter) => {
  if (find(StorageAdapters, { name })) {
    _remove(StorageAdapters, { name });
  }
  StorageAdapters.push({ name, download, upload, remove, request });
}