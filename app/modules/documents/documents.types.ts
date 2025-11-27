export interface GetDocumentsParams {
  collection: string;
  match: {} | any;
  sort?: Record<string, any>;
  populate?: { path: string; select?: string }[];
  page?: number | string;
  pageSize?: number | string;
}

export interface GetDocumentsResult<T = any> {
  currentPage: number;
  totalPages: number;
  count: number;
  data: T[];
}

export interface CountDocumentsParams {
  collection: string;
  match: {} | any;
}

export type CountDocumentsResult = number;

export interface CreateDocumentParams {
  collection: string;
  update: any;
}
export interface CreateDocumentResult<T = any> {
  data: T;
}

export interface GetDocumentParams {
  collection: string;
  match: any;
}

export interface GetDocumentResult<T = any> {
  data: T | null;
}

export interface UpdateDocumentParams {
  collection: string;
  match: { _id: string };
  update: any;
}
export interface UpdateDocumentResult<T = any> {
  data: T | null;
}

export interface DeleteDocumentParams {
  collection: string;
  match: { _id: string };
}

export type DeleteDocumentResult = boolean;

export interface DocumentAdapter {
  name: string;
  getDocuments: <T = any>(params: GetDocumentsParams) => Promise<GetDocumentsResult<T>>;
  countDocuments: (params: CountDocumentsParams) => Promise<CountDocumentsResult>;
  createDocument: <T = any>(params: CreateDocumentParams) => Promise<CreateDocumentResult<T>>;
  getDocument: <T = any>(params: GetDocumentParams) => Promise<GetDocumentResult<T>>;
  updateDocument: <T = any>(params: UpdateDocumentParams) => Promise<UpdateDocumentResult<T>>;
  deleteDocument: (params: DeleteDocumentParams) => Promise<DeleteDocumentResult>;
}
