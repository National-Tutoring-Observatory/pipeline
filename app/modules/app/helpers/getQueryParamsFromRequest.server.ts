export type defaultQueryParams = {
  searchValue?: string,
  currentPage?: number,
  sort?: string,
  filters?: {}
}

export default function getQueryParamsFromRequest(request: Request, defaultQueryParams: defaultQueryParams) {

  const url = new URL(request.url);

  let queryParams: Record<string, string | number | {}> = { ...defaultQueryParams };
  const filters: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    if (key.startsWith("filter_")) {
      const filterKey = key.replace("filter_", "");
      filters[filterKey] = value;
    } else if (key === "currentPage") {
      queryParams[key] = Number(value);
    } else {
      queryParams[key] = value;
    }
  });

  if (Object.keys(filters).length > 0) {
    queryParams.filters = filters;
  }

  return queryParams;
}
