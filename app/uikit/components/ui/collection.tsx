import clsx from "clsx";
import map from "lodash/map";
import React, { type ReactElement } from "react";
import { Link } from "react-router";
import { ActionBar, type Action } from "./actionBar";
import type {
  CollectionItemAction,
  CollectionItemAttributes,
} from "./collectionContentItem";
import CollectionItemContent from "./collectionContentItem";
import { CollectionEmpty } from "./collectionEmpty";
import type { FiltersProps } from "./filters";
import { Item, ItemGroup, ItemSeparator } from "./item";
import type { PaginationProps } from "./pagination";
import type { SearchProps } from "./search";
import type { SortProps } from "./sort";

export type CollectionProps = {
  items: any[];
  itemsLayout: "list" | "card";
  actions?: Action[];
  hasSearch?: boolean;
  hasPagination?: boolean;
  isSyncing?: boolean;
  emptyAttributes: {
    title?: string;
    description?: string;
    icon?: ReactElement;
    actions?: Action[];
  };
  renderItem?: (item: any) => ReactElement;
  getItemAttributes: (item: any) => CollectionItemAttributes;
  getItemActions: (item: any) => CollectionItemAction[];
  onItemClicked?: (id: string) => void;
  onActionClicked: (action: string) => void;
  onItemActionClicked?: ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => void;
};

const Collection = ({
  items,
  itemsLayout = "list",
  actions = [],
  filters = [],
  filtersValues,
  sortOptions,
  sortValue,
  searchValue,
  hasSearch,
  hasPagination,
  isSyncing,
  currentPage,
  totalPages,
  emptyAttributes = {},
  renderItem,
  getItemAttributes,
  getItemActions,
  onItemClicked,
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onFiltersValueChanged,
  onSortValueChanged,
}: CollectionProps &
  SearchProps &
  PaginationProps &
  FiltersProps &
  SortProps) => {
  return (
    <div>
      <ActionBar
        actions={actions}
        filters={filters}
        filtersValues={filtersValues}
        sortOptions={sortOptions}
        sortValue={sortValue}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        hasSearch={hasSearch}
        hasPagination={hasPagination}
        isSyncing={isSyncing}
        onActionClicked={onActionClicked}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
        onFiltersValueChanged={onFiltersValueChanged}
        onSortValueChanged={onSortValueChanged}
      />
      {items.length === 0 && (
        <CollectionEmpty
          searchValue={searchValue}
          filtersValues={filtersValues}
          emptyAttributes={emptyAttributes}
          onActionClicked={onActionClicked}
        />
      )}
      <ItemGroup
        className={clsx({
          "rounded-sm border": itemsLayout === "list",
          "grid grid-cols-3 gap-4": itemsLayout === "card",
        })}
      >
        {map(items, (item, index) => {
          if (!getItemAttributes) {
            console.warn("getItemAttribtues must be defined on the Collection");
            return null;
          }

          const { id, title, description, to, meta, isDisabled } =
            getItemAttributes(item);

          const itemActions = getItemActions(item);

          return (
            <React.Fragment key={id}>
              <Item
                asChild
                variant={itemsLayout === "card" ? "outline" : undefined}
                className={clsx({ "opacity-50": isDisabled })}
              >
                {to && !isDisabled ? (
                  <Link to={to}>
                    {(renderItem && renderItem(item)) || (
                      <CollectionItemContent
                        id={id}
                        title={title}
                        description={description}
                        meta={meta}
                        actions={itemActions}
                        isDisabled={isDisabled}
                        onItemActionClicked={onItemActionClicked}
                      />
                    )}
                  </Link>
                ) : (
                  <div
                    className={clsx({
                      "hover:bg-accent/50 cursor-pointer": onItemClicked,
                    })}
                    onClick={() => {
                      if (onItemClicked) {
                        onItemClicked(item._id);
                      }
                    }}
                  >
                    {(renderItem && renderItem(item)) || (
                      <CollectionItemContent
                        id={id}
                        title={title}
                        description={description}
                        meta={meta}
                        actions={itemActions}
                        isDisabled={isDisabled}
                        onItemActionClicked={onItemActionClicked}
                      />
                    )}
                  </div>
                )}
              </Item>
              {index !== items.length - 1 && itemsLayout === "list" && (
                <ItemSeparator />
              )}
            </React.Fragment>
          );
        })}
      </ItemGroup>
    </div>
  );
};

export { Collection };
