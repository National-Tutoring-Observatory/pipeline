export interface File {
  _id: string;
  name: string;
  project: string;
  fileType: string;
  hasUploaded?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type FileType = 'CSV' | 'JSON' | 'JSONL' | 'VTT';
