import { useState } from 'react';
import UploadFiles from "../components/uploadFiles";
import type { FileType } from '../files.types';
import getInstructionsByFileType from '../helpers/getInstructionsByFileType';
import useFileAccumulator from '../hooks/useFileAccumulator';

interface UploadFilesContainerProps {
  onUploadFiles: ({ acceptedFiles, fileType }: { acceptedFiles: File[], fileType: FileType }) => void;
}

export default function UploadFilesContainer({ onUploadFiles }: UploadFilesContainerProps) {
  const { acceptedFiles, addFiles, removeFile } = useFileAccumulator();
  const [fileType, setFileType] = useState<FileType>('CSV');
  const [isUploading, setIsUploading] = useState(false);

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
      onDrop={addFiles}
      onDeleteAcceptedFileClicked={removeFile}
      onUploadFilesClicked={onUploadFilesClicked}
      onFileTypeChanged={onFileTypeChanged}
    />
  );
}
