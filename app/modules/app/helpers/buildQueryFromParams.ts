import escapeRegExp from "lodash/escapeRegExp";
import has from "lodash/has";

export type QueryParams = {
  searchValue?: string;
  currentPage?: number;
  filters?: Record<string, string>;
  sort?: string;
};
type BuildQueryProps = {
  match: any;
  queryParams: QueryParams;
  searchableFields: string[];
  sortableFields: string[];
  filterableFields?: string[];
};
export type Query = { match: any; sort?: any; page?: number };

function regexMatch(field: string, value: string) {
  return { [field]: { $regex: new RegExp(escapeRegExp(value), "i") } };
}

function addConditionToMatch(currentMatch: any, newCondition: any) {
  if (Object.keys(currentMatch).length === 0) {
    return newCondition;
  }
  return {
    $and: [currentMatch, newCondition],
  };
}

export function buildQueryFromParams({
  match = {},
  queryParams,
  searchableFields,
  sortableFields,
  filterableFields,
}: BuildQueryProps): Query {
  let query = { match } as Query;

  const searchValue = queryParams.searchValue;
  if (searchValue) {
    if (!searchableFields || searchableFields.length === 0) {
      throw new Error(
        "Search value provided but no searchable fields are configured.",
      );
    }
    let conditions: any[] = [];
    for (const field of searchableFields) {
      conditions.push(regexMatch(field, searchValue));
    }

    const searchCondition =
      conditions.length === 1 ? conditions[0] : { $or: conditions };

    query.match = addConditionToMatch(query.match, searchCondition);
  }

  const filters = queryParams.filters;
  if (filters && Object.keys(filters).length > 0) {
    if (!filterableFields || filterableFields.length === 0) {
      throw new Error(
        "Filters provided but no filterable fields are configured.",
      );
    }

    const filterConditions: any = {};
    for (const field of filterableFields) {
      if (has(filters, field)) {
        filterConditions[field] = filters[field];
      }
    }

    if (Object.keys(filterConditions).length > 0) {
      query.match = addConditionToMatch(query.match, filterConditions);
    }
  }

  const sort = queryParams.sort;
  if (sort) {
    if (typeof sort !== "string") {
      throw new Error("Sort parameter must be a string.");
    }
    if (!sortableFields.includes(sort.replace("-", ""))) {
      throw new Error("Invalid sort field.");
    }
    query.sort = sort;
  } else {
    query.sort = null;
  }

  query.page = queryParams.currentPage;

  return query;
}

export default buildQueryFromParams;
