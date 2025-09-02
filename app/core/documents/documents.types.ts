export interface DocumentAdapter {
  name: string;
  getDocuments: ({ collection, match, sort }: { collection: string; match: {} | any; sort: {}; }) => Promise<unknown>
}