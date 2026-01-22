export type QueryParams = {
  searchValue?: string;
  currentPage?: number;
  sort?: string;
  filters?: Record<string, string>;
};

export default function getQueryParamsFromRequest(
  request: Request,
  defaults: QueryParams,
  options?: { paramPrefix?: string },
): QueryParams {
  const url = new URL(request.url);
  const filters: Record<string, string> = {};

  const prefix = options?.paramPrefix || "";
  const searchValueKey = prefix ? `${prefix}SearchValue` : "searchValue";
  const currentPageKey = prefix ? `${prefix}CurrentPage` : "currentPage";
  const sortKey = prefix ? `${prefix}Sort` : "sort";
  const filterPrefix = prefix ? `${prefix}Filter_` : "filter_";

  let searchValue = defaults.searchValue;
  let currentPage = defaults.currentPage;
  let sort = defaults.sort;

  url.searchParams.forEach((value, key) => {
    if (key.startsWith(filterPrefix)) {
      filters[key.replace(filterPrefix, "")] = value;
    } else if (key === searchValueKey) {
      searchValue = value;
    } else if (key === currentPageKey) {
      currentPage = Number(value);
    } else if (key === sortKey) {
      sort = value;
    }
  });

  return {
    searchValue,
    currentPage,
    sort,
    filters: Object.keys(filters).length > 0 ? filters : defaults.filters,
  };
}
