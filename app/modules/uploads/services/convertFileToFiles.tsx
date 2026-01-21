import fs from "fs";
import path from "path";
import { handler as splitDataToSessions } from "../../../functions/splitDataToSessions/app";
import removeFile from "./removeFile";
import uploadFile from "./uploadFile";

export default async function convertFileToFiles({
  file,
  entityId,
}: {
  file: File;
  entityId: string;
}): Promise<File[]> {
  const splitFiles = [];
  const uploadDirectory = `storage/${entityId}/tmp`;
  const fileName = path.basename(file.name);
  const uploadPath = path.join(uploadDirectory, fileName);

  await uploadFile({ file, uploadPath });

  await splitDataToSessions({
    body: {
      contentType: "JSONL",
      inputFile: uploadPath,
      outputFolder: uploadDirectory,
      outputFileKey: "id",
      sessionLimit: 1,
      sessionSkip: 0,
    },
  });

  await removeFile({ path: path.join(uploadDirectory, fileName) });

  const jsonsInDir = fs
    .readdirSync(uploadDirectory)
    .filter((file) => path.extname(file) === ".json");

  for (const file of jsonsInDir) {
    const blob = await fs.openAsBlob(path.join(uploadDirectory, file));
    const blobFile = new File([blob], file);
    splitFiles.push(blobFile);
  }

  return splitFiles;
}
