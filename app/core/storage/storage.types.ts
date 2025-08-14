export interface StorageAdapter {
  name: string;
  init: () => void;
  upload: (params: { file: File, filePath: string, outputDirectory: string }) => Promise<unknown>;
  remove: () => void;
}