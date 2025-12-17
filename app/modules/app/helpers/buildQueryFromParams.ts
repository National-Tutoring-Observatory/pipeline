import escapeRegExp from 'lodash/escapeRegExp';
import has from 'lodash/has';

export type QueryParams = { searchValue?: string, currentPage?: string, filters?: Record<string, string>, sort?: string }
type BuildQueryProps = {
  match: any,
  queryParams: QueryParams,
  searchableFields: string[]
  sortableFields: string[],
  filterableFields?: string[]
}
export type Query = { match: any, sort?: any, page?: string }

function regexMatch(field: string, value: string) {
  return { [field]: { $regex: new RegExp(escapeRegExp(value), "i") } };
}

export function buildQueryFromParams({
  match = {},
  queryParams,
  searchableFields,
  sortableFields,
  filterableFields
}: BuildQueryProps): Query {
  let query = { match } as Query;

  const searchValue = queryParams.searchValue;
  if (searchValue) {
    if (!searchableFields || searchableFields.length === 0) {
      throw new Error('Search value provided but no searchable fields are configured.');
    }
    let conditions: any[] = [];
    for (const field of searchableFields) {
      conditions.push(regexMatch(field, searchValue));
    }
    if (conditions.length == 1) {
      query.match = { ...query.match, ...conditions[0] };
    } else if (conditions.length > 1) {
      query.match = { ...query.match, $or: conditions };
    }
  }

  const filters = queryParams.filters;
  if (filters && Object.keys(filters).length > 0) {
    if (!filterableFields || filterableFields.length === 0) {
      throw new Error('Filters provided but no filterable fields are configured.');
    }

    for (const field of filterableFields) {
      if (has(filters, field)) {
        const filterValue = filters[field];

        if (query.match[field] !== undefined) {
          // Use $and to combine both conditions, remove field from root to avoid duplication
          query.match.$and = [
            { [field]: query.match[field] },
            { [field]: filterValue }
          ];
          delete query.match[field];
        } else {
          query.match[field] = filterValue;
        }
      }
    }
  }

  const sort = queryParams.sort;
  if (sort) {
    if (typeof sort !== 'string') {
      throw new Error('Sort parameter must be a string.');
    }
    if (!sortableFields.includes(sort.replace('-', ''))) {
      throw new Error('Invalid sort field.');
    }
    query.sort = sort
  } else {
    query.sort = null;
  }

  query.page = queryParams.currentPage;

  return query
}

export default buildQueryFromParams
