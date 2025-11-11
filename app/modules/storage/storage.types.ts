export interface StorageAdapter {
  name: string;
  /**
   * Downloads a file and returns the local path to the downloaded file.
   * @param params Object containing the sourcePath (remote path or key).
   * @returns The absolute path to the downloaded file in the local tmp directory.
   * @throws {Error} If the file cannot be downloaded or does not exist.
   */
  download: (params: { sourcePath: string }) => Promise<string>;
  upload: (params: { file: any, uploadPath: string }) => Promise<unknown>;
  remove: () => void;
  request: (url: string, options: any) => Promise<unknown>;
}
