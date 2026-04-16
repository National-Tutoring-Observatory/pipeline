import getFileInfo from "../../storage/helpers/getFileInfo";
import getStorageAdapter from "../../storage/helpers/getStorageAdapter";

export default async function uploadFile({
  file,
  uploadPath,
}: {
  file: Blob;
  uploadPath: string;
}): Promise<void> {
  const storage = getStorageAdapter();
  const { buffer, type, size } = await getFileInfo(file);
  await storage.upload({ file: { buffer, type, size }, uploadPath });
}
