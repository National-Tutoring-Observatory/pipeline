import { useState } from 'react';
import UploadFiles from '../components/uploadFiles';
import type { FileType } from '../files.types';
import { SUPPORTED_FILE_TYPES } from '../constants';
import getInstructionsByFileType from '../helpers/getInstructionsByFileType';
import useFileAccumulator from '../hooks/useFileAccumulator';

interface UploadFilesContainerProps {
  onUploadFiles: ({ acceptedFiles }: { acceptedFiles: File[] }) => void;
}

export default function UploadFilesContainer({ onUploadFiles }: UploadFilesContainerProps) {
  const { acceptedFiles, addFiles, removeFile } = useFileAccumulator();
  const [isUploading, setIsUploading] = useState(false);

  const onUploadFilesClicked = () => {
    setIsUploading(true);
    onUploadFiles({ acceptedFiles });
  };

  const instructionsByType = SUPPORTED_FILE_TYPES.reduce((acc, fileType) => {
    acc[fileType] = getInstructionsByFileType({ fileType });
    return acc;
  }, {} as Record<FileType, { overview: string, link: string }>);

  return (
    <UploadFiles
      acceptedFiles={acceptedFiles}
      instructionsByType={instructionsByType}
      isUploading={isUploading}
      onDrop={addFiles}
      onDeleteAcceptedFileClicked={removeFile}
      onUploadFilesClicked={onUploadFilesClicked}
    />
  );
}
