export type defaultQueryParams = {
  searchValue?: string,
  currentPage?: number,
  sort?: string,
  filters?: {}
}

export default function getQueryParamsFromRequest(request: Request, defaultQueryParams: defaultQueryParams) {

  const url = new URL(request.url);

  let queryParams: Record<string, string | number | {}> = { ...defaultQueryParams };

  url.searchParams.forEach((value, key) => {
    if (url.searchParams.has(key)) {
      queryParams[key] = value;
    }
  });

  return queryParams;
}
