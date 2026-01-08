import { useState } from 'react';

type AcceptedFile = File & { _id: string };

export function getFileKey(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

export default function useFileAccumulator() {
  const [acceptedFiles, setAcceptedFiles] = useState<AcceptedFile[]>([]);

  const addFiles = (files: File[]) => {
    const existingKeys = new Set(acceptedFiles.map((f) => f._id));
    const newFiles: AcceptedFile[] = [];
    for (const file of files) {
      const key = getFileKey(file);
      if (!existingKeys.has(key)) {
        (file as AcceptedFile)._id = key;
        newFiles.push(file as AcceptedFile);
      }
    }
    setAcceptedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setAcceptedFiles((prev) => prev.filter((f) => f._id !== id));
  };

  return { acceptedFiles, addFiles, removeFile };
}
