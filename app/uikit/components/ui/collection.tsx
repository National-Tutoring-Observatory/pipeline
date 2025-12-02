import map from 'lodash/map';
import React, { type ReactElement } from 'react';
import { Link } from 'react-router';
import { Badge } from './badge';
import { Button } from './button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from './item';


export type CollectionProps<T> = {
  items: T[]
  getItemAttributes: (item: T) => CollectionItemAttributes<T>
  renderItem?: (item: T) => ReactElement,
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
  title: string
  description?: string
  to?: string,
  meta: CollectionItemMeta<unknown>[]
}

const CollectionItemContent = ({ title, description, meta }: Omit<CollectionItemProps, 'to'>) => (
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
    <ItemActions>
      <Button onClick={(event) => { event.preventDefault(); event.stopPropagation() }}>
        View
      </Button>
    </ItemActions>
  </>
);

const Collection = <T,>({
  items,
  getItemAttributes,
  renderItem
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

          return (
            <React.Fragment key={id}>
              <Item asChild>
                {to ? (
                  <Link to={to}>
                    {(renderItem) && (
                      renderItem(item)
                    ) || (
                        <CollectionItemContent title={title} description={description} meta={meta} />
                      )}
                  </Link>
                ) : (
                  <div>
                    {(renderItem) && (
                      renderItem(item)
                    ) || (
                        <CollectionItemContent title={title} description={description} meta={meta} />
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
