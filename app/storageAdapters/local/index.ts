
import fse from 'fs-extra';
import path from 'path';
import { PROJECT_ROOT } from '~/helpers/projectRoot';
import registerStorageAdapter from "~/modules/storage/helpers/registerStorageAdapter";

registerStorageAdapter({
  name: 'LOCAL',
  download: async ({ downloadPath }): Promise<string> => {
    const absolutePath = path.resolve(PROJECT_ROOT, downloadPath);
    const exists = await fse.exists(absolutePath);
    if (!exists) {
      throw new Error(`LOCAL: File not found: ${absolutePath}`);
    }
    try {
      const destinationPath = path.join(PROJECT_ROOT, 'tmp', downloadPath);
      await fse.copy(absolutePath, destinationPath);
      return destinationPath;
    } catch (error) {
      throw new Error(`LOCAL: Error copying file to tmp for ${downloadPath}: ${error instanceof Error ? error.message : String(error)}`);
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
  remove: () => { console.log('removing'); },
  request: (url, options) => {
    return new Promise((resolve) => {
      resolve(`/${url}`);
    });
  }
})
