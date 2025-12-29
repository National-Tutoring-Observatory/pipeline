import { useState } from 'react';
import UploadFiles from "../components/uploadFiles";
import type { FileType } from '../files.types';
import getInstructionsByFileType from '../helpers/getInstructionsByFileType';

type AcceptedFile = File & { _id: string };

function getFileKey(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

interface UploadFilesContainerProps {
  onUploadFiles: ({ acceptedFiles, fileType }: { acceptedFiles: File[], fileType: FileType }) => void;
}

export default function UploadFilesContainer({ onUploadFiles }: UploadFilesContainerProps) {
  const [acceptedFiles, setAcceptedFiles] = useState<AcceptedFile[]>([]);
  const [fileType, setFileType] = useState<FileType>('CSV');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = (droppedFiles: File[]) => {
    const existingKeys = new Set(acceptedFiles.map((f) => f._id));
    const newFiles: AcceptedFile[] = [];
    for (const file of droppedFiles) {
      const key = getFileKey(file);
      if (!existingKeys.has(key)) {
        (file as AcceptedFile)._id = key;
        newFiles.push(file as AcceptedFile);
      }
    }
    setAcceptedFiles((prev) => [...prev, ...newFiles]);
  };

  const onDeleteAcceptedFileClicked = (id: string) => {
    setAcceptedFiles((prev) => prev.filter((f) => f._id !== id));
  };

  const onUploadFilesClicked = () => {
    setIsUploading(true);
    onUploadFiles({ acceptedFiles, fileType });
  };

  const onFileTypeChanged = (newFileType: FileType) => {
    if (newFileType) {
      setFileType(newFileType);
    }
  };

  return (
    <UploadFiles
      acceptedFiles={acceptedFiles}
      fileType={fileType}
      instructions={getInstructionsByFileType({ fileType })}
      isUploading={isUploading}
      onDrop={onDrop}
      onDeleteAcceptedFileClicked={onDeleteAcceptedFileClicked}
      onUploadFilesClicked={onUploadFilesClicked}
      onFileTypeChanged={onFileTypeChanged}
    />
  );
}
