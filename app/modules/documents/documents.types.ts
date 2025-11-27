export interface GetDocumentsParams {
  collection: string;
  match: {} | any;
  sort?: Record<string, any>;
  populate?: { path: string; select?: string }[];
  page?: number | string;
  pageSize?: number | string;
}

export interface GetDocumentsResult {
  currentPage: number;
  totalPages: number;
  count: number;
  data: any[];
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

export interface CreateDocumentResult {
  data: any;
}

export interface GetDocumentParams {
  collection: string;
  match: any;
}

export interface GetDocumentResult {
  data: any | null;
}

export interface UpdateDocumentParams {
  collection: string;
  match: { _id: string };
  update: any;
}

export interface UpdateDocumentResult {
  data: any;
}

export interface DeleteDocumentParams {
  collection: string;
  match: { _id: string };
}

export type DeleteDocumentResult = boolean;

export interface DocumentAdapter {
  name: string;
  getDocuments: (params: GetDocumentsParams) => Promise<GetDocumentsResult>;
  countDocuments: (params: CountDocumentsParams) => Promise<CountDocumentsResult>;
  createDocument: (params: CreateDocumentParams) => Promise<CreateDocumentResult>;
  getDocument: (params: GetDocumentParams) => Promise<GetDocumentResult>;
  updateDocument: (params: UpdateDocumentParams) => Promise<UpdateDocumentResult>;
  deleteDocument: (params: DeleteDocumentParams) => Promise<DeleteDocumentResult>;
}
