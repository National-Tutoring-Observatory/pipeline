import path from 'path';
import getFileInfo from '../../storage/helpers/getFileInfo';
import getStorageAdapter from '../../storage/helpers/getStorageAdapter';

export default async function uploadFile({ file, uploadDirectory }: { file: any, uploadDirectory: string }): Promise<void> {
  const storage = getStorageAdapter();
  const sanitizedFilename = path.basename(file.name);
  const uploadPath = path.join(uploadDirectory, sanitizedFilename);

  const { buffer, contentType, size } = await getFileInfo(file);

  await storage.upload({ file: { buffer, contentType, size }, uploadPath });

}
