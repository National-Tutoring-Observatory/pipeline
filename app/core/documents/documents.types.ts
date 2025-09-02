export interface DocumentAdapter {
  name: string;
  getDocuments: ({ collection, match, sort }: { collection: string; match: {} | any; sort: {}; }) => Promise<unknown>;
  createDocument: ({ collection, update }: { collection: string; update: any; }) => Promise<unknown>;
  getDocument: ({ collection, match }: { collection: string; match: any; }) => Promise<unknown>;
  updateDocument: ({ collection, match, update }: { collection: string; match: { _id: number; }; update: {}; }) => Promise<unknown>;
  deleteDocument: ({ collection, match }: { collection: string; match: { _id: number; }; }) => Promise<unknown>;
}