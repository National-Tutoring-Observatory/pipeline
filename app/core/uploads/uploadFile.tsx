import path from 'path';
import fse from 'fs-extra';
import getStorage from '../storage/helpers/getStorage';
import getFileInfo from '../storage/helpers/getFileInfo';

export default async function uploadFile({ file, uploadDirectory }: { file: any, uploadDirectory: string }): Promise<void> {
  const storage = getStorage();
  const sanitizedFilename = path.basename(file.name);
  const uploadPath = path.join(uploadDirectory, sanitizedFilename);

  const { buffer, contentType, size } = await getFileInfo(file);

  if (storage) {
    await storage.upload({ file: { buffer, contentType, size }, uploadPath });
  }

}