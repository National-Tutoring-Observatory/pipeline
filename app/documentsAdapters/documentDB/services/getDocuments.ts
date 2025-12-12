import type { GetDocumentsParams, GetDocumentsResult } from '~/modules/documents/documents.types';
import getModelFromCollection from '../../../modules/documents/helpers/getModelFromCollection';
import getDatabaseConnection from '../helpers/getDatabaseConnection';

const DEFAULT_PAGE_SIZE = 20;

export default async function getDocuments<T = any>({
  collection,
  match,
  sort = {},
  populate = [],
  page,
  pageSize
}: GetDocumentsParams): Promise<GetDocumentsResult<T>> {

  try {
    const connection = await getDatabaseConnection();

    const model = getModelFromCollection(collection);
    const Model = connection.models[model];

    let data = [];
    let currentPage;
    let totalPages;
    let count;

    if (page === undefined) {
      data = await Model.find(match)
        .sort(sort)
        .populate(populate);

      count = data.length;
      currentPage = 1;
      totalPages = 1;
    } else {
      const parsedPage = parseInt(String(page), 10);
      if (isNaN(parsedPage) || !Number.isInteger(parsedPage) || parsedPage < 1) {
        throw new Error(`Invalid page number: ${page}`);
      }

      const parsedPageSize = pageSize !== undefined ? parseInt(String(pageSize), 10) : DEFAULT_PAGE_SIZE;
      if (isNaN(parsedPageSize) || !Number.isInteger(parsedPageSize) || parsedPageSize < 1) {
        throw new Error(`Invalid page size: ${pageSize}`);
      }

      const skip = (parsedPage - 1) * parsedPageSize;

      data = await Model.find(match)
        .sort(sort)
        .skip(skip)
        .limit(parsedPageSize)
        .populate(populate);

      count = await Model.countDocuments(match);
      currentPage = parsedPage;
      totalPages = Math.max(1, Math.ceil(count / parsedPageSize));
    }

    return {
      currentPage: currentPage,
      totalPages: totalPages,
      count,
      data: JSON.parse(JSON.stringify(data)) as any as T[]
    }

  } catch (error) {
    console.log(error);
    throw error;
  }
}
