export interface DocumentAdapter {
  name: string;
  getDocuments: ({ collection, match, sort, populate }: {
    collection: string;
    match: {} | any;
    sort?: {};
    populate?: { path: string, select?: string }[]
  }) => Promise<unknown>;
  countDocuments: ({ collection, match }: {
    collection: string;
    match: {} | any;
  }) => Promise<unknown>;
  createDocument: ({ collection, update }: { collection: string; update: any; }) => Promise<unknown>;
  getDocument: ({ collection, match }: { collection: string; match: any; }) => Promise<unknown>;
  updateDocument: ({ collection, match, update }: { collection: string; match: { _id: string; }; update: {}; }) => Promise<unknown>;
  deleteDocument: ({ collection, match }: { collection: string; match: { _id: string; }; }) => Promise<unknown>;
}
