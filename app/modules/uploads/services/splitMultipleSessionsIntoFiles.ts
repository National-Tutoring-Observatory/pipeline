import detectFileType from '~/modules/files/helpers/detectFileType';
import { SUPPORTED_FILE_TYPES } from '~/modules/files/constants';
import parseCSV from '../parsers/csvParser';
import parseJSONL from '../parsers/jsonlParser';

export default async function splitMultipleSessionsIntoFiles({
  files,
}: {
  files: File[];
}): Promise<File[]> {
  if (files.length === 0) {
    throw new Error('No files provided.');
  }

  const splitFiles: File[] = [];
  const sessionIds = new Set<string>();

  for (const file of files) {
    const detectedType = detectFileType(file.name);

    if (!detectedType || !SUPPORTED_FILE_TYPES.includes(detectedType)) {
      throw new Error(
        `Unsupported file type: "${file.name}". Only ${SUPPORTED_FILE_TYPES.join(', ')} files are allowed.`
      );
    }

    const fileContents = await file.text();
    let sessionDataMap: Record<string, any[]>;

    try {
      if (detectedType === 'JSONL') {
        sessionDataMap = parseJSONL(fileContents);
      } else if (detectedType === 'CSV') {
        sessionDataMap = parseCSV(fileContents);
      } else {
        throw new Error(`Unsupported file type: ${detectedType}`);
      }
    } catch (error) {
      throw new Error(
        `Error parsing ${detectedType} file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Check for session_id collisions
    for (const sessionId of Object.keys(sessionDataMap)) {
      if (sessionIds.has(sessionId)) {
        throw new Error(
          `Session ID collision detected: "${sessionId}" appears in multiple files. Each session must have a unique ID.`
        );
      }
      sessionIds.add(sessionId);
    }

    for (const [sessionId, sessionData] of Object.entries(sessionDataMap)) {
      const splitFileName = `${sessionId.replace(/\.[^.]+$/, '')}.json`;

      const newFile = new File([JSON.stringify(sessionData)], splitFileName, {
        type: 'application/json',
      });

      splitFiles.push(newFile);
    }
  }

  return splitFiles;
}
