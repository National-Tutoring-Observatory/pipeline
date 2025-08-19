export interface StorageAdapter {
  name: string;
  download: (params: { downloadPath: string }) => Promise<unknown>;
  upload: (params: { file: any, uploadPath: string }) => Promise<unknown>;
  remove: () => void;
}