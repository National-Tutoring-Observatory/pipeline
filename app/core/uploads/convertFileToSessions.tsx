import path from "path";
import uploadFile from "./uploadFile";
import removeFile from "./removeFile";
import { handler as splitDataToSessions } from '../../functions/splitDataToSessions/app';
import fs from 'fs';

export default async function convertFileToSessions({ file, entityId, }: { file: File, entityId: string }): Promise<File[]> {
  const splitFiles = [];
  const outputDirectory = `./storage/${entityId}/tmp`;

  await uploadFile({ file, outputDirectory });

  const fileName = path.basename(file.name);

  await splitDataToSessions({
    body: {
      contentType: 'JSONL',
      inputFile: path.join(outputDirectory, fileName),
      outputFolder: `./storage/${entityId}/tmp`,
      outputFileKey: 'id',
      sessionLimit: 10,
      sessionSkip: 0
    }
  });

  await removeFile({ path: path.join(outputDirectory, fileName) });

  const jsonsInDir = fs.readdirSync(outputDirectory).filter(file => path.extname(file) === '.json');

  for (const file of jsonsInDir) {
    const blob = await fs.openAsBlob(path.join(outputDirectory, file));
    const blobFile = new File([blob], file);
    splitFiles.push(blobFile);
  }

  return splitFiles;

}