export interface StorageAdapter {
  name: string;
  upload: (params: { file: File, uploadPath: string, uploadDirectory: string }) => Promise<unknown>;
  remove: () => void;
}