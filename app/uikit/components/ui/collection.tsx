import map from 'lodash/map';
import { EllipsisVertical } from 'lucide-react';
import React, { type ReactElement } from 'react';
import { Link } from 'react-router';
import { Badge } from './badge';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from './item';


export type CollectionProps<T> = {
  items: T[]
  renderItem?: (item: T) => ReactElement,
  getItemAttributes: (item: T) => CollectionItemAttributes<T>
  getItemActions: (item: T) => CollectionItemAction[]
  onItemActionClicked: ({ id, action }: { id: string, action: string }) => void
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
  renderItem,
  getItemAttributes,
  getItemActions,
  onItemActionClicked
}: CollectionProps<T>) => {

  return (
    <div>
      <ItemGroup className="border rounded-sm">
        {map(items, (item, index) => {

          if (!getItemAttributes) {
            console.warn('getItemAttribtues must be defined on the Collection');
            return null;
          }

          const { id, title, description, to, meta } = getItemAttributes(item);

          const actions = getItemActions(item);

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
                          actions={actions}
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
                          actions={actions}
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
