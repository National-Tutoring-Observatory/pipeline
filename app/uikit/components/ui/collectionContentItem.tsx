import map from "lodash/map";
import { EllipsisVertical } from "lucide-react";
import React, { type ReactElement } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { ItemActions, ItemContent, ItemDescription, ItemTitle } from "./item";

export type CollectionItemAction = {
  icon?: ReactElement;
  action: string;
  text: string;
  variant?: "default" | "destructive" | undefined;
};

export type CollectionItemMeta = {
  text: string;
  icon?: ReactElement;
};

export type CollectionItemAttributes = {
  id: string;
  title: string;
  description?: string;
  to?: string;
  meta?: CollectionItemMeta[];
  isDisabled?: boolean;
};

type CollectionItemProps = {
  id: string;
  title: string;
  description?: string;
  to?: string;
  meta?: CollectionItemMeta[];
  actions: CollectionItemAction[];
  isDisabled?: boolean;
  onItemActionClicked?: ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => void;
};

const CollectionItemContent = ({
  id,
  title,
  description,
  meta = [],
  actions = [],
  isDisabled = false,
  onItemActionClicked,
}: Omit<CollectionItemProps, "to">) => (
  <>
    <ItemContent className="gap-1">
      <ItemTitle className="text-lg">{title}</ItemTitle>
      <ItemDescription>{description}</ItemDescription>
      <div className="flex w-full flex-wrap gap-2">
        {map(meta, (metaItem, index) => {
          return (
            <Badge
              key={index}
              variant="outline"
              className="text-muted-foreground"
            >
              {metaItem.icon && metaItem.icon}
              {metaItem.text}
            </Badge>
          );
        })}
      </div>
    </ItemContent>
    {actions.length > 0 && (
      <ItemActions>
        {(actions.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isDisabled}>
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
                  <React.Fragment key={action.action}>
                    <DropdownMenuItem
                      variant={action.variant}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        if (onItemActionClicked) {
                          onItemActionClicked({ id, action: action.action });
                        }
                      }}
                    >
                      {action.icon ? action.icon : null}
                      {action.text}
                    </DropdownMenuItem>
                    {index !== actions.length - 1 && <DropdownMenuSeparator />}
                  </React.Fragment>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )) || (
          <Button
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              if (onItemActionClicked) {
                onItemActionClicked({ id, action: actions[0].action });
              }
            }}
          >
            {actions[0].icon ? actions[0].icon : null}
            {actions[0].text}
          </Button>
        )}
      </ItemActions>
    )}
  </>
);

export default CollectionItemContent;
