
import fse from 'fs-extra';
import path from 'path';
import { PROJECT_ROOT } from '~/helpers/projectRoot';
import registerStorageAdapter from "~/modules/storage/helpers/registerStorageAdapter";

registerStorageAdapter({
  name: 'LOCAL',
  download: async ({ sourcePath }): Promise<string> => {
    const absolutePath = path.resolve(PROJECT_ROOT, sourcePath);
    const exists = await fse.exists(absolutePath);
    if (!exists) {
      throw new Error(`LOCAL: File not found: ${absolutePath}`);
    }
    try {
      const destinationPath = path.join(PROJECT_ROOT, 'tmp', sourcePath);
      await fse.copy(absolutePath, destinationPath);
      return destinationPath;
    } catch (error) {
      throw new Error(`LOCAL: Error copying file to tmp for ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  upload: async ({ file, uploadPath }: { file: any, uploadPath: string }): Promise<void> => {
    try {
      const absoluteUploadPath = path.resolve(PROJECT_ROOT, uploadPath);
      const { buffer } = file;
      await fse.outputFile(absoluteUploadPath, buffer);
    } catch (error) {
      console.log(error);
    }
  },
  remove: async ({ sourcePath }: { sourcePath: string }) => {
    const absolutePath = path.resolve(PROJECT_ROOT, sourcePath);
    await fse.remove(absolutePath);
  },
  removeDir: async ({ sourcePath }: { sourcePath: string }) => {
    const absolutePath = path.resolve(PROJECT_ROOT, sourcePath);
    await fse.remove(absolutePath);
  },
  request: (url, _) => {
    return new Promise((resolve) => {
      resolve(`/${url}`);
    });
  }
})
