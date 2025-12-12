/**
 * Sort parameter type supporting multiple Mongoose sort formats:
 * - Numeric object: { field: 1, otherField: -1 } (1 = asc, -1 = desc)
 * - String object: { field: 'asc', otherField: 'desc' }
 * - String format: 'field -otherField' (space-separated, dash prefix for desc)
 * - Array format: [['field', 'asc'], ['otherField', 'desc']]
 * - Null/undefined: no sorting applied
 *
 * Note: The local adapter handles numeric and may not fully support all formats
 * The DocumentDB adapter passes sort directly to Mongoose, supporting all formats
 */
export type SortParam =
  | Record<string, 1 | -1 | 'asc' | 'desc'>
  | string
  | Array<[string, 'asc' | 'desc']>
  | null
  | undefined;

export interface GetDocumentsParams {
  collection: string;
  match: {} | any;
  sort?: SortParam;
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

export interface DeleteDocumentsParams {
  collection: string;
  match: any;
}

export type DeleteDocumentsResult = number;

export interface DocumentAdapter {
  name: string;
  getDocuments: <T = any>(params: GetDocumentsParams) => Promise<GetDocumentsResult<T>>;
  countDocuments: (params: CountDocumentsParams) => Promise<CountDocumentsResult>;
  createDocument: <T = any>(params: CreateDocumentParams) => Promise<CreateDocumentResult<T>>;
  getDocument: <T = any>(params: GetDocumentParams) => Promise<GetDocumentResult<T>>;
  updateDocument: <T = any>(params: UpdateDocumentParams) => Promise<UpdateDocumentResult<T>>;
  deleteDocument: (params: DeleteDocumentParams) => Promise<DeleteDocumentResult>;
  deleteDocuments: (params: DeleteDocumentsParams) => Promise<DeleteDocumentsResult>;
}
