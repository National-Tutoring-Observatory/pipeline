import { useEffect, useState } from "react";
import { useNavigation, useSearchParams } from "react-router";

const DEBOUNCE_TIME = 600;

type DefaultQueryParams = {
  searchValue?: string;
  currentPage?: number;
  sortValue?: string;
  filters?: Record<string, unknown> | null;
};

function parseFiltersFromUrl(
  searchParams: URLSearchParams,
  defaultFilters?: Record<string, unknown> | null,
  prefix: string = "",
): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  const filterPrefix = prefix ? `${prefix}Filter_` : "filter_";

  searchParams.forEach((value, key) => {
    if (key.startsWith(filterPrefix)) {
      const filterKey = key.replace(filterPrefix, "");
      filters[filterKey] = value;
    }
  });

  return Object.keys(filters).length > 0 ? filters : (defaultFilters ?? {});
}

export function useSearchQueryParams(
  defaultQueryParams: DefaultQueryParams,
  options?: { paramPrefix?: string },
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useNavigation();

  const prefix = options?.paramPrefix || "";
  const searchValueKey = prefix ? `${prefix}SearchValue` : "searchValue";
  const currentPageKey = prefix ? `${prefix}CurrentPage` : "currentPage";
  const sortKey = prefix ? `${prefix}Sort` : "sort";

  const [searchValue, setSearchValueState] = useState<string>(
    searchParams.get(searchValueKey) ?? defaultQueryParams.searchValue ?? "",
  );

  const [currentPage, setCurrentPageState] = useState<number>(
    searchParams.get(currentPageKey)
      ? Number(searchParams.get(currentPageKey))
      : (defaultQueryParams.currentPage ?? 1),
  );

  const [sortValue, setSortValueState] = useState<string>(
    searchParams.get(sortKey) ?? defaultQueryParams.sortValue ?? "",
  );

  const [filtersValues, setFiltersValuesState] = useState<
    Record<string, unknown>
  >(parseFiltersFromUrl(searchParams, defaultQueryParams.filters, prefix));

  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    if (
      searchValue ===
      (searchParams.get(searchValueKey) ?? defaultQueryParams.searchValue ?? "")
    ) {
      return;
    }

    setIsPending(true);

    const handler = setTimeout(() => {
      setSearchParams(
        (prevSearchParams: URLSearchParams) => {
          const newSearchParams = new URLSearchParams(
            prevSearchParams.toString(),
          );

          if (searchValue) {
            newSearchParams.set(searchValueKey, searchValue);
          } else {
            newSearchParams.delete(searchValueKey);
          }

          newSearchParams.set(currentPageKey, "1");
          setCurrentPageState(1);

          return newSearchParams;
        },
        { replace: true },
      );
    }, DEBOUNCE_TIME);

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchValue,
    defaultQueryParams.searchValue,
    searchParams,
    setSearchParams,
    searchValueKey,
    currentPageKey,
  ]);

  useEffect(() => {
    if (state === "idle") {
      setIsPending(false);
    }
  }, [state]);

  const isSyncing = isPending || state === "loading";

  const updateUrlParam = <T extends string | number>(
    key: string,
    value: T,
    setStateFunction: React.Dispatch<React.SetStateAction<T>>,
  ) => {
    setStateFunction(value);

    setSearchParams(
      (prevSearchParams: URLSearchParams) => {
        const newSearchParams = new URLSearchParams(
          prevSearchParams.toString(),
        );

        if (value === "" || value === null || value === undefined) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }

        if (key !== currentPageKey) {
          newSearchParams.set(currentPageKey, "1");
          setCurrentPageState(1);
        }

        return newSearchParams;
      },
      { replace: true },
    );
  };

  const updateUrlParamObject = (
    key: string,
    value: Record<string, unknown>,
    setStateFunction: React.Dispatch<
      React.SetStateAction<Record<string, unknown>>
    >,
  ) => {
    setStateFunction(value);

    setSearchParams(
      (prevSearchParams: URLSearchParams) => {
        const newSearchParams = new URLSearchParams(
          prevSearchParams.toString(),
        );

        const filterPrefix = prefix ? `${prefix}Filter_` : "filter_";

        // Remove all existing filter_* params
        const keysToDelete: string[] = [];
        newSearchParams.forEach((_, paramKey) => {
          if (paramKey.startsWith(filterPrefix)) {
            keysToDelete.push(paramKey);
          }
        });
        keysToDelete.forEach((k) => newSearchParams.delete(k));

        // Add new filter params
        if (value && Object.keys(value).length > 0) {
          Object.entries(value).forEach(([filterKey, filterValue]) => {
            if (
              filterValue !== null &&
              filterValue !== undefined &&
              filterValue !== ""
            ) {
              newSearchParams.set(`${filterPrefix}${filterKey}`, String(filterValue));
            }
          });
        }

        if (key !== currentPageKey) {
          newSearchParams.set(currentPageKey, "1");
          setCurrentPageState(1);
        }

        return newSearchParams;
      },
      { replace: true },
    );
  };

  return {
    searchValue,
    setSearchValue: setSearchValueState,
    currentPage,
    setCurrentPage: (value: number) =>
      updateUrlParam<number>(currentPageKey, value, setCurrentPageState),
    sortValue,
    setSortValue: (value: string) =>
      updateUrlParam<string>(sortKey, value, setSortValueState),
    filtersValues,
    setFiltersValues: (value: Record<string, unknown>) =>
      updateUrlParamObject("filters", value, setFiltersValuesState),
    isSyncing,
  };
}
