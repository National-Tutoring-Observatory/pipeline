export interface File {
  _id: string;
  name: string;
  createdAt: string;
  project: string;
  fileType: string;
}

export type FileType = 'CSV' | 'JSON' | 'JSONL' | 'VTT';
