export interface Project {
  _id: string;
  name: string;
  createdAt: string;
  isUploadingFiles: boolean;
  isConvertingFiles: boolean;
  hasSetupProject: boolean;
}