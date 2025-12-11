import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const DEBOUNCE_TIME = 600;

type DefaultQueryParams = {
  searchValue?: string;
  currentPage?: number;
  sortValue?: string;
  filters?: Record<string, unknown> | null;
};

function parseFiltersFromUrl(filterStr: string | null, defaultFilters?: Record<string, unknown> | null): Record<string, unknown> {
  if (!filterStr) return defaultFilters ?? {};
  try {
    return JSON.parse(filterStr) as Record<string, unknown>;
  } catch {
    return defaultFilters ?? {};
  }
}

export function useSearchQueryParams(defaultQueryParams: DefaultQueryParams) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchValue, setSearchValueState] = useState<string>(
    searchParams.get("searchValue") ?? defaultQueryParams.searchValue ?? ""
  );

  const [currentPage, setCurrentPageState] = useState<number>(
    searchParams.get("currentPage") ? Number(searchParams.get("currentPage")) : (defaultQueryParams.currentPage ?? 1)
  );

  const [sortValue, setSortValueState] = useState<string>(
    searchParams.get("sort") ?? defaultQueryParams.sortValue ?? ""
  );

  const [filtersValues, setFiltersValuesState] = useState<Record<string, unknown>>(
    parseFiltersFromUrl(searchParams.get("filters"), defaultQueryParams.filters)
  );

  useEffect(() => {
    if (searchValue === (searchParams.get("searchValue") ?? defaultQueryParams.searchValue ?? "")) {
      return;
    }

    const handler = setTimeout(() => {
      setSearchParams((prevSearchParams: URLSearchParams) => {
        const newSearchParams = new URLSearchParams(prevSearchParams.toString());

        if (searchValue) {
          newSearchParams.set("searchValue", searchValue);
        } else {
          newSearchParams.delete("searchValue");
        }

        newSearchParams.set("currentPage", "1");
        setCurrentPageState(1);

        return newSearchParams;
      }, { replace: true });
    }, DEBOUNCE_TIME);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue, defaultQueryParams.searchValue, searchParams, setSearchParams]);

  const updateUrlParam = <T extends string | number>(
    key: string,
    value: T,
    setStateFunction: React.Dispatch<React.SetStateAction<T>>
  ) => {
    setStateFunction(value);

    setSearchParams((prevSearchParams: URLSearchParams) => {
      const newSearchParams = new URLSearchParams(prevSearchParams.toString());

      if (value === "" || value === null || value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }

      if (key !== "currentPage") {
        newSearchParams.set("currentPage", "1");
        setCurrentPageState(1);
      }

      return newSearchParams;
    }, { replace: true });
  };

  const updateUrlParamObject = (
    key: string,
    value: Record<string, unknown>,
    setStateFunction: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
  ) => {
    setStateFunction(value);

    setSearchParams((prevSearchParams: URLSearchParams) => {
      const newSearchParams = new URLSearchParams(prevSearchParams.toString());

      const stringified = JSON.stringify(value || {});
      if (!stringified || stringified === "{}") {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, stringified);
      }

      if (key !== "currentPage") {
        newSearchParams.set("currentPage", "1");
        setCurrentPageState(1);
      }

      return newSearchParams;
    }, { replace: true });
  };

  return {
    searchValue,
    setSearchValue: setSearchValueState,
    currentPage,
    setCurrentPage: (value: number) => updateUrlParam<number>("currentPage", value, setCurrentPageState),
    sortValue,
    setSortValue: (value: string) => updateUrlParam<string>("sort", value, setSortValueState),
    filtersValues,
    setFiltersValues: (value: Record<string, unknown>) => updateUrlParamObject("filters", value, setFiltersValuesState),
  };
}
