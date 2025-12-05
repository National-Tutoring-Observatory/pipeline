import clsx from 'clsx';
import map from 'lodash/map';
import React, { type ReactElement } from 'react';
import { Link } from 'react-router';
import { ActionBar, type Action } from './actionBar';
import { Button } from './button';
import type { CollectionItemAction, CollectionItemAttributes } from './collectionContentItem';
import CollectionItemContent from './collectionContentItem';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty';
import type { FiltersProps } from './filters';
import { Item, ItemGroup, ItemSeparator } from './item';
import type { PaginationProps } from './pagination';
import type { SearchProps } from './search';


export type CollectionProps = {
  items: any[]
  itemsLayout: 'list' | 'card',
  actions?: Action[]
  hasSearch?: boolean,
  hasPagination?: boolean,
  isSyncing?: boolean,
  emptyAttributes: {
    title?: string,
    description?: string,
    icon?: ReactElement,
    actions?: Action[]
  }
  renderItem?: (item: any) => ReactElement,
  getItemAttributes: (item: any) => CollectionItemAttributes
  getItemActions: (item: any) => CollectionItemAction[]
  onActionClicked: (action: string) => void,
  onItemActionClicked: ({ id, action }: { id: string, action: string }) => void,
}

const Collection = ({
  items,
  itemsLayout = 'list',
  actions,
  filters,
  filtersValues,
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
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onFiltersValueChanged
}: CollectionProps & SearchProps & PaginationProps & FiltersProps) => {

  return (
    <div>
      <ActionBar
        actions={actions}
        filters={filters}
        filtersValues={filtersValues}
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
      />
      {(items.length === 0) && (
        <Empty>
          <EmptyHeader>
            {(emptyAttributes.icon) && (
              <EmptyMedia variant="icon">
                {emptyAttributes.icon}
              </EmptyMedia>
            )}
            <EmptyTitle>{emptyAttributes.title}</EmptyTitle>
            <EmptyDescription>
              {emptyAttributes.description}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              {map(emptyAttributes.actions, (action, index) => {
                const variant = index > 0 ? 'outline' : undefined;
                return (
                  <Button key={action.action} variant={variant} onClick={() => onActionClicked(action.action)}>{action.text}</Button>
                )
              })}
            </div>
          </EmptyContent>
        </Empty>
      )}
      <ItemGroup className={clsx({
        "border rounded-sm": itemsLayout === 'list',
        "grid grid-cols-3 gap-4": itemsLayout === 'card'
      })}>
        {map(items, (item, index) => {

          if (!getItemAttributes) {
            console.warn('getItemAttribtues must be defined on the Collection');
            return null;
          }

          const { id, title, description, to, meta, isDisabled } = getItemAttributes(item);

          const itemActions = getItemActions(item);

          return (
            <React.Fragment key={id}>
              <Item asChild variant={itemsLayout === 'card' ? 'outline' : undefined} className={clsx({ 'opacity-50': isDisabled })}>
                {to && !isDisabled ? (
                  <Link to={to}>
                    {(renderItem) && (
                      renderItem(item)
                    ) || (
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
                  <div>
                    {(renderItem) && (
                      renderItem(item)
                    ) || (
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
              {(index !== items.length - 1) && (itemsLayout === 'list') && <ItemSeparator />}
            </React.Fragment>
          );
        })}
      </ItemGroup>
    </div>
  )
}

export { Collection };
