import path from 'path';
import fse from 'fs-extra';

export default async function uploadFile({ file, outputDirectory }: { file: any, outputDirectory: string }): Promise<void> {

  await fse.ensureDir(outputDirectory);

  const sanitizedFilename = path.basename(file.name);
  const filePath = path.join(outputDirectory, sanitizedFilename);

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve) => {
    setTimeout(async () => {
      await fse.writeFile(filePath, buffer);
      resolve();
    }, 300);
  })


}