import find from 'lodash/find';
import _remove from 'lodash/remove';
import type { StorageAdapter } from "../storage.types";

export const StorageAdapters: StorageAdapter[] = [];

export default ({ name, download, upload, remove, removeDir, request }: StorageAdapter) => {
  if (find(StorageAdapters, { name })) {
    _remove(StorageAdapters, { name });
  }
  StorageAdapters.push({ name, download, upload, remove, removeDir, request });
}
