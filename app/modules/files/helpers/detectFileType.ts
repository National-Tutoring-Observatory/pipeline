import type { FileType } from '../files.types';

const EXTENSION_MAP: Record<string, FileType> = {
  '.csv': 'CSV',
  '.jsonl': 'JSONL',
};

export default function detectFileType(fileName: string): FileType | null {
  const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  return EXTENSION_MAP[extension] || null;
}

export function getDetectedFileTypes(files: { name: string }[]): FileType[] {
  const types = new Set<FileType>();
  files.forEach((file) => {
    const type = detectFileType(file.name);
    if (type) {
      types.add(type);
    }
  });
  return Array.from(types);
}
