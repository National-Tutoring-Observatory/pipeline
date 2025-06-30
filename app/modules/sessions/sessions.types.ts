export interface Session {
  _id: string;
  name: string;
  createdAt: string;
  project: string;
  file: string;
  hasConverted: boolean;
}