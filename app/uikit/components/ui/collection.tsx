import map from 'lodash/map';
import React from 'react';
import { Link } from 'react-router';
import { Button } from './button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from './item';


export type CollectionProps<T> = {
  items: T[]
  getItemAttributes: (item: T) => CollectionItemAttributes<T>
}

export type CollectionItemAttributes<T> = {
  id: string,
  title: string,
  description?: string,
  to?: string
}

type CollectionItemProps = {
  title: string
  description?: string
  to?: string
}

const CollectionItemContent = ({ title, description }: Omit<CollectionItemProps, 'to'>) => (
  <>
    <ItemContent className="gap-1">
      <ItemTitle>{title}</ItemTitle>
      <ItemDescription>{description}</ItemDescription>
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
}: CollectionProps<T>) => {

  return (
    <div>
      <ItemGroup className="border rounded-sm">
        {map(items, (item, index) => {

          if (!getItemAttributes) {
            console.warn('getItemAttribtues must be defined on the Collection');
            return null;
          }

          const { id, title, description, to } = getItemAttributes(item);

          return (
            <React.Fragment key={id}>
              <Item asChild>
                {to ? (
                  <Link to={to}>
                    <CollectionItemContent title={title} description={description} />
                  </Link>
                ) : (
                  <div>
                    <CollectionItemContent title={title} description={description} />
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
