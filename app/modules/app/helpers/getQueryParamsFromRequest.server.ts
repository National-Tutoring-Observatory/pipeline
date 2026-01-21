export type QueryParams = {
  searchValue?: string;
  currentPage?: number;
  sort?: string;
  filters?: Record<string, string>;
};

export default function getQueryParamsFromRequest(
  request: Request,
  defaults: QueryParams,
): QueryParams {
  const url = new URL(request.url);
  const filters: Record<string, string> = {};

  let searchValue = defaults.searchValue;
  let currentPage = defaults.currentPage;
  let sort = defaults.sort;

  url.searchParams.forEach((value, key) => {
    if (key.startsWith("filter_")) {
      filters[key.replace("filter_", "")] = value;
    } else if (key === "searchValue") {
      searchValue = value;
    } else if (key === "currentPage") {
      currentPage = Number(value);
    } else if (key === "sort") {
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
