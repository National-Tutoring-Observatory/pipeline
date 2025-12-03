import map from 'lodash/map';
import { Button } from './button';
import type { CollectionProps } from './collection';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./empty";

export function CollectionEmpty({
  emptyAttributes,
  onActionClicked,
}: Pick<CollectionProps, 'emptyAttributes' | 'onActionClicked'>) {
  return (

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
  )
}
