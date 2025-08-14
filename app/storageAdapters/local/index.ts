import registerStorage from "~/core/storage/helpers/registerStorage";
import fse from 'fs-extra';

registerStorage({
  name: 'LOCAL',
  init: () => {
    console.log('init');
  },
  upload: async ({ file, filePath, outputDirectory }: { file: File, filePath: string, outputDirectory: string }): Promise<void> => {
    await fse.ensureDir(outputDirectory);

    const buffer = Buffer.from(await file.arrayBuffer());

    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        await fse.writeFile(filePath, buffer);
        resolve();
      }, 300);
    })
  },
  remove: () => { console.log('removing'); },
})