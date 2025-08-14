import path from 'path';
import fse from 'fs-extra';
import getStorage from '../storage/helpers/getStorage';

export default async function uploadFile({ file, outputDirectory }: { file: any, outputDirectory: string }): Promise<void> {

  const storage = getStorage();
  const sanitizedFilename = path.basename(file.name);
  const filePath = path.join(outputDirectory, sanitizedFilename);

  if (storage) {
    await storage.upload({ file, filePath, outputDirectory });
  }

}