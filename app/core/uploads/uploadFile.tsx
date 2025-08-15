import path from 'path';
import fse from 'fs-extra';
import getStorage from '../storage/helpers/getStorage';

export default async function uploadFile({ file, uploadDirectory }: { file: any, uploadDirectory: string }): Promise<void> {

  const storage = getStorage();
  const sanitizedFilename = path.basename(file.name);
  const uploadPath = path.join(uploadDirectory, sanitizedFilename);

  console.log(uploadPath);
  console.log(uploadDirectory);

  if (storage) {
    await storage.upload({ file, uploadPath, uploadDirectory });
  }

}