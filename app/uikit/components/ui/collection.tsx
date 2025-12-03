import map from 'lodash/map';
import { EllipsisVertical } from 'lucide-react';
import React, { type ReactElement } from 'react';
import { Link } from 'react-router';
import { ActionBar, type Action } from './actionBar';
import { Badge } from './badge';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from './item';
import type { PaginationProps } from './pagination';
import type { SearchProps } from './search';


export type CollectionProps<T> = {
  items: T[]
  actions: Action[]
  hasSearch?: boolean,
  hasPagination?: boolean,
  emptyAttributes: {
    title?: string,
    description?: string,
    icon?: ReactElement,
    actions?: Action[]
  }
  renderItem?: (item: T) => ReactElement,
  getItemAttributes: (item: T) => CollectionItemAttributes<T>
  getItemActions: (item: T) => CollectionItemAction[]
  onActionClicked: (action: string) => void,
  onItemActionClicked: ({ id, action }: { id: string, action: string }) => void,
}

export type CollectionItemAction = {
  icon?: ReactElement,
  action: string,
  text: string,
  variant?: "default" | "destructive" | undefined
}

export type CollectionItemMeta<T> = {
  text: string,
  icon?: ReactElement
}

export type CollectionItemAttributes<T> = {
  id: string,
  title: string,
  description?: string,
  to?: string,
  meta: CollectionItemMeta<T>[]
}

type CollectionItemProps = {
  id: string
  title: string
  description?: string
  to?: string,
  meta: CollectionItemMeta<unknown>[]
  actions: CollectionItemAction[]
  onItemActionClicked: ({ id, action }: { id: string, action: string }) => void
}

const CollectionItemContent = ({
  id,
  title,
  description,
  meta,
  actions = [],
  onItemActionClicked,
}: Omit<CollectionItemProps, 'to'>) => (
  <>
    <ItemContent className="gap-1">
      <ItemTitle className="text-lg">{title}</ItemTitle>
      <ItemDescription>{description}</ItemDescription>
      <div className="flex w-full flex-wrap gap-2">
        {map(meta, (metaItem, index) => {
          return (
            <Badge key={index} variant="outline" className="text-muted-foreground">
              {(metaItem.icon) && (
                metaItem.icon
              )}
              {metaItem.text}
            </Badge>
          );
        })}
      </div>
    </ItemContent>
    {(actions.length > 0) && (
      <ItemActions>
        {(actions.length > 1) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <EllipsisVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {map(actions, (action, index) => {
                return (
                  <>
                    <DropdownMenuItem variant={action.variant} onClick={(event) => {
                      event.stopPropagation();
                      onItemActionClicked({ id, action: action.action })
                    }}>
                      {action.icon ? action.icon : null}
                      {action.text}
                    </DropdownMenuItem>
                    {(index !== actions.length - 1) && (
                      <DropdownMenuSeparator />
                    )}
                  </>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) || (
            <Button variant="ghost" onClick={(event) => {
              event.stopPropagation();
              onItemActionClicked({ id, action: actions[0].action })
            }}>
              {actions[0].icon ? actions[0].icon : null}
              {actions[0].text}
            </Button>
          )}

      </ItemActions>
    )}
  </>
);

const Collection = <T,>({
  items,
  actions,
  searchValue,
  hasSearch,
  hasPagination,
  currentPage,
  totalPages,
  emptyAttributes = {},
  renderItem,
  getItemAttributes,
  getItemActions,
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged
}: CollectionProps<T> & SearchProps & PaginationProps) => {

  return (
    <div>
      <ActionBar
        actions={actions}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        hasSearch={hasSearch}
        hasPagination={hasPagination}
        onActionClicked={onActionClicked}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
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
      <ItemGroup className="border rounded-sm">
        {map(items, (item, index) => {

          if (!getItemAttributes) {
            console.warn('getItemAttribtues must be defined on the Collection');
            return null;
          }

          const { id, title, description, to, meta } = getItemAttributes(item);

          const itemActions = getItemActions(item);

          return (
            <React.Fragment key={id}>
              <Item asChild>
                {to ? (
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
                          onItemActionClicked={onItemActionClicked}
                        />
                      )}
                  </div>
                )}
              </Item>
              {index !== items.length - 1 && <ItemSeparator />}
            </React.Fragment>
          );
        })}
      </ItemGroup>
    </div>
  )
}

export default Collection
