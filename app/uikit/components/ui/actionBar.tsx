import clsx from 'clsx';
import map from 'lodash/map';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Button } from './button';
import { Pagination, type PaginationProps } from './pagination';
import { Search, type SearchProps } from './search';
import { Spinner } from './spinner';

export type Action = {
  icon?: ReactElement,
  action: string,
  text: string,
  variant?: "default" | "destructive" | undefined
}

export type ActionBarProps = {
  actions: Action[]
  hasSearch?: boolean,
  hasPagination?: boolean,
  isSyncing?: boolean,
  onActionClicked: (action: string) => void
}

function ActionBar({
  actions,
  searchValue,
  hasSearch = false,
  hasPagination = false,
  isSyncing = false,
  currentPage = 1,
  totalPages = 1,
  onActionClicked,
  onSearchValueChanged,
  onPaginationChanged
}: ActionBarProps & SearchProps & PaginationProps) {

  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setIsStuck(!entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-4" aria-hidden />

      <div className={clsx(`flex justify-between sticky top-4 border p-2 mb-2 transition-all rounded-2xl bg-white`, {
        'shadow -mx-2': isStuck
      })}>
        <div className="w-1/3">
          {(hasSearch) && (
            <Search
              searchValue={searchValue}
              onSearchValueChanged={onSearchValueChanged}
            />
          )}
        </div>
        <div className="w-1/3 flex justify-center">
          {(hasPagination) && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPaginationChanged={onPaginationChanged}
            />
          )}
        </div>
        <div className="flex gap-x-1 w-1/3 justify-end">
          {map(actions, (action) => {
            return (
              <Button key={action.action} onClick={() => onActionClicked(action.action)}>
                {action.icon ? action.icon : null}
                {action.text}
              </Button>
            );
          })}
        </div>
        {(isSyncing) && (
          <div className={clsx("absolute left-1/2 -translate-x-1/2 bg-white border-b border-x pb-1 px-6 top-full rounded-b-md", {
            "shadow": isStuck
          })}>
            <div className="flex items-center gap-x-2 text-xs">
              <Spinner className="size-3" /> Syncing
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export { ActionBar };
