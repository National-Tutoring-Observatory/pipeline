import getFileInfo from "../../storage/helpers/getFileInfo";
import getStorageAdapter from "../../storage/helpers/getStorageAdapter";

export default async function uploadFile({
  file,
  uploadPath,
}: {
  file: any;
  uploadPath: string;
}): Promise<void> {
  const storage = getStorageAdapter();
  const { buffer, contentType, size } = await getFileInfo(file);
  await storage.upload({ file: { buffer, contentType, size }, uploadPath });
}
