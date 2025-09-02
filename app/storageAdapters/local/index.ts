import registerStorageAdapter from "~/core/storage/helpers/registerStorageAdapter";
import fse from 'fs-extra';
import path from 'path';

registerStorageAdapter({
  name: 'LOCAL',
  download: async ({ downloadPath }) => {
    try {
      await fse.exists(downloadPath);
      await fse.copy(downloadPath, path.join('tmp', downloadPath));
    } catch (error) {
      console.log(error);
    }
  },
  upload: async ({ file, uploadPath }: { file: any, uploadPath: string }): Promise<void> => {
    try {
      const { buffer } = file;
      await fse.outputFile(uploadPath, buffer);

    } catch (error) {
      console.log(error);
    }
  },
  remove: () => { console.log('removing'); },
  request: (url, options) => {
    return new Promise((resolve) => {
      resolve(url);
    });
  }
})