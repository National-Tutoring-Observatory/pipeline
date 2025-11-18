import { parse } from 'csv-parse/sync';
import type { FileType } from '~/modules/files/files.types';

export default async function splitMultipleSessionsIntoFiles({ files, fileType }: { files: File[], fileType: FileType }): Promise<File[]> {
  const splitFiles = [];
  let fileIndex = 0;

  for (const file of files) {

    let lineIndex = 0;
    const fileContents = await file.text();

    if (fileType === 'JSONL') {

      const lines = fileContents.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;
        const splitFileName = `session-${fileIndex + 1}-${lineIndex + 1}.json`;

        const options = {
          type: 'application/json',
        };

        const newFile = new File([line], splitFileName, options);

        splitFiles.push(newFile);
        lineIndex++;
      }
    } else if (fileType === 'CSV') {

      const lines = parse(fileContents, {
        columns: true,
        skip_empty_lines: true,
      }) as Array<Record<string, string>>;

      const files = new Map();

      for (const line of lines) {
        const sessionId = line.session_id;
        if (!files.has(sessionId)) {
          files.set(sessionId, []);
        }
        files.get(sessionId).push(line);
      }

      for (const [fileId, fileObject] of files.entries()) {
        const splitFileName = `${fileId.replace(/\.[^.]+$/, '')}.json`;

        const options = {
          type: 'application/json',
        };

        const newFile = new File([JSON.stringify(fileObject)], splitFileName, options);

        splitFiles.push(newFile);

        lineIndex++;
      }

    }

    fileIndex++;

  }

  return splitFiles;

}
