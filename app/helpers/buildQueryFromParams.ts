import escapeRegExp from 'lodash/escapeRegExp'

export type QueryParams = { searchValue?: string, page?: string, filters?: Record<string, string>, sort?: string }
type BuildQueryProps = {
  queryParams: QueryParams,
  searchableFields: string[]
  sortableFields: string[],
  filterableFields?: string[],
  filterableValues?: {
    [key: string]: string[]
  },
}
export type Query = { match: any, sort?: any, page?: string }

function regexMatch(field: string, value: string) {
  return { [field]: { $regex: new RegExp(escapeRegExp(value), "i") } };
}

export function buildQueryFromParams({ queryParams, searchableFields, sortableFields, filterableFields, filterableValues }: BuildQueryProps): Query {
  let query = { match: {} } as Query;

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

  const filters = queryParams.filters
  if (filters) {
    if (!filterableFields || filterableFields.length === 0) {
      throw new Error('Filters provided but no filterable fields are configured.');
    }

    let conditions: any[] = [];
    for (const field of filterableFields) {
      const val = filters[field];
      if (val) {
        if (typeof val !== 'string') {
          throw new Error(`Filter value for ${field} must be a string.`);
        }
        if (filterableValues && filterableValues[field] && !filterableValues[field].includes(val)) {
          throw new Error(`Access to the specified ${field} is not allowed.`);
        }
        conditions.push({ [field]: { $in: [val] } });
      }
      if (conditions.length == 1) {
        query.match = { ...query.match, ...conditions[0] };
      } else if (conditions.length > 1) {
        query.match = { ...query.match, $and: conditions };
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
    query.sort = {}
  }

  query.page = queryParams.page;

  return query
}

export default buildQueryFromParams
