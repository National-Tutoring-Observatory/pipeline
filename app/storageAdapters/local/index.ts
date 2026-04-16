import fse from "fs-extra";
import path from "path";
import { PROJECT_ROOT } from "~/helpers/projectRoot";
import registerStorageAdapter from "~/modules/storage/helpers/registerStorageAdapter";
import type {
  DownloadParams,
  RemoveDirParams,
  RemoveParams,
  RequestParams,
  UploadParams,
} from "~/modules/storage/storage.types";

registerStorageAdapter({
  name: "LOCAL",
  download: async ({
    sourcePath,
    destinationPath,
  }: DownloadParams): Promise<string> => {
    const absolutePath = path.resolve(PROJECT_ROOT, sourcePath);
    const exists = await fse.exists(absolutePath);
    if (!exists) {
      throw new Error(`LOCAL: File not found: ${absolutePath}`);
    }
    try {
      const tmpPath = path.join(
        PROJECT_ROOT,
        "tmp",
        destinationPath || sourcePath,
      );
      await fse.copy(absolutePath, tmpPath);
      return tmpPath;
    } catch (error) {
      throw new Error(`LOCAL: Error copying file to tmp for ${sourcePath}`, {
        cause: error,
      });
    }
  },
  upload: async ({ file, uploadPath }: UploadParams): Promise<void> => {
    try {
      const absoluteUploadPath = path.resolve(PROJECT_ROOT, uploadPath);
      const { buffer } = file;
      await fse.outputFile(absoluteUploadPath, buffer);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  remove: async ({ sourcePath }: RemoveParams): Promise<void> => {
    const absolutePath = path.resolve(PROJECT_ROOT, sourcePath);
    await fse.remove(absolutePath);
  },
  removeDir: async ({ sourcePath }: RemoveDirParams): Promise<void> => {
    const absolutePath = path.resolve(PROJECT_ROOT, sourcePath);
    await fse.remove(absolutePath);
  },
  request: ({ url }: RequestParams): Promise<unknown> => {
    return new Promise((resolve) => {
      resolve(`/${url}`);
    });
  },
});
