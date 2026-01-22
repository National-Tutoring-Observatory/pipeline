import type { FetcherWithComponents } from "react-router";
import UploadFiles from "../components/uploadFiles";
import { SUPPORTED_FILE_TYPES } from "../constants";
import type { FileType } from "../files.types";
import getInstructionsByFileType from "../helpers/getInstructionsByFileType";
import useFileAccumulator from "../hooks/useFileAccumulator";

interface UploadFilesData {
  errors?: Record<string, string>;
  success?: boolean;
}

interface UploadFilesContainerProps {
  projectId: string;
  uploadFetcher: FetcherWithComponents<UploadFilesData>;
}

export default function UploadFilesContainer({
  projectId,
  uploadFetcher,
}: UploadFilesContainerProps) {
  const { acceptedFiles, addFiles, removeFile } = useFileAccumulator();

  const instructionsByType = SUPPORTED_FILE_TYPES.reduce(
    (acc, fileType) => {
      acc[fileType] = getInstructionsByFileType({ fileType });
      return acc;
    },
    {} as Record<FileType, { overview: string; link: string }>,
  );

  const handleUpload = () => {
    const formData = new FormData();
    formData.append(
      "body",
      JSON.stringify({
        intent: "UPLOAD_PROJECT_FILES",
        entityId: projectId,
      }),
    );

    acceptedFiles.forEach((file) => {
      formData.append("files", file);
    });

    uploadFetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    });
  };

  return (
    <UploadFiles
      acceptedFiles={acceptedFiles}
      instructionsByType={instructionsByType}
      isUploading={uploadFetcher.state === "submitting"}
      onDrop={addFiles}
      onDeleteAcceptedFileClicked={removeFile}
      fetcher={uploadFetcher}
      onUploadClick={handleUpload}
    />
  );
}
