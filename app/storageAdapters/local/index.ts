import registerStorage from "~/core/storage/helpers/registerStorage";
import fse from 'fs-extra';

registerStorage({
  name: 'LOCAL',
  upload: async ({ file, uploadPath, uploadDirectory }: { file: File, uploadPath: string, uploadDirectory: string }): Promise<void> => {
    await fse.ensureDir(uploadDirectory);

    const buffer = Buffer.from(await file.arrayBuffer());

    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        await fse.writeFile(uploadPath, buffer);
        resolve();
      }, 300);
    })
  },
  remove: () => { console.log('removing'); },
})