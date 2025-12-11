export interface DownloadParams {
  sourcePath: string;
}

export interface UploadParams {
  file: any;
  uploadPath: string;
}

export interface RemoveParams {
  sourcePath: string;
}

export interface RemoveDirParams {
  sourcePath: string;
}

export interface RequestParams {
  url: string;
  options?: any;
}

/**
 * StorageAdapter is a plugin-based interface for abstracting storage operations.
 *
 * The NTO Pipeline supports multiple storage backends (local filesystem, AWS S3) through
 * adapter implementations. Adapters are self-registering and selected at runtime via
 * environment variables (STORAGE_ADAPTER).
 *
 * Usage:
 * ```typescript
 * import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';
 *
 * const storage = getStorageAdapter();
 * const filePath = await storage.download({ sourcePath: 'path/to/file.json' });
 * const data = await fse.readFile(filePath);
 * ```
 *
 * Adapters automatically wrap return values, so callers work with simple types:
 * - download: Returns the absolute path string directly
 * - upload: Returns void on success
 * - remove/removeDir: Return void on success
 * - request: Returns the URL or data directly (e.g., S3 signed URL)
 */
export interface StorageAdapter {
  name: string;

  /**
   * Downloads a file from storage to the local tmp directory.
   *
   * The adapter handles creating necessary directories and copying/streaming the file.
   * The file is copied to `tmp/{sourcePath}` to maintain directory structure.
   *
   * @param params Download parameters including the source path
   * @returns Promise resolving to the absolute path of the downloaded file in tmp
   * @throws {Error} If the file does not exist or cannot be downloaded
   *
   * @example
   * const path = await storage.download({ sourcePath: 'storage/project1/file.json' });
   * // path => '/absolute/path/to/tmp/storage/project1/file.json'
   */
  download: (params: DownloadParams) => Promise<string>;

  /**
   * Uploads a file to storage.
   *
   * The adapter handles writing the file to the specified location in storage.
   * For S3, this includes multipart upload configuration for large files.
   *
   * @param params Upload parameters including file and destination path
   * @returns Promise resolving when upload is complete
   * @throws {Error} If the upload fails
   *
   * @example
   * const buffer = Buffer.from('{"data": "value"}');
   * await storage.upload({
   *   file: { buffer, size: buffer.length, type: 'application/json' },
   *   uploadPath: 'storage/project1/output.json'
   * });
   */
  upload: (params: UploadParams) => Promise<void>;

  /**
   * Removes a single file from storage.
   *
   * @param params Remove parameters including the file path
   * @returns Promise resolving when file is removed
   * @throws {Error} If the file cannot be removed
   *
   * @example
   * await storage.remove({ sourcePath: 'storage/project1/file.json' });
   */
  remove: (params: RemoveParams) => Promise<void>;

  /**
   * Removes a directory and all its contents from storage.
   *
   * This is a recursive delete operation. For S3, it handles batch deletes
   * respecting AWS limits.
   *
   * @param params RemoveDir parameters including the directory path
   * @returns Promise resolving when directory is removed
   * @throws {Error} If the directory cannot be removed
   *
   * @example
   * await storage.removeDir({ sourcePath: 'storage/project1/' });
   */
  removeDir: (params: RemoveDirParams) => Promise<void>;

  /**
   * Requests access to a file, typically generating a signed URL for S3.
   *
   * For local storage, this returns a relative path.
   * For S3, this generates a pre-signed URL that expires in 1 hour.
   *
   * @param params Request parameters including the file path/key
   * @returns Promise resolving to the accessible URL or path
   * @throws {Error} If URL generation fails
   *
   * @example
   * const url = await storage.request({ url: 'storage/project1/file.json' });
   * // Local: 'storage/project1/file.json'
   * // S3: 'https://bucket.s3.amazonaws.com/storage/project1/file.json?...'
   */
  request: (params: RequestParams) => Promise<unknown>;
}
