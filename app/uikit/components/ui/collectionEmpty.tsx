import map from "lodash/map";
import { SearchSlash } from "lucide-react";
import { Button } from "./button";
import type { CollectionProps } from "./collection";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";
import type { FiltersProps } from "./filters";
import type { SearchProps } from "./search";

export function CollectionEmpty({
  searchValue,
  filtersValues,
  emptyAttributes,
  onActionClicked,
}: Pick<CollectionProps, "emptyAttributes" | "onActionClicked"> &
  Pick<SearchProps, "searchValue"> &
  Pick<FiltersProps, "filtersValues">) {
  let { icon, title, description, actions } = emptyAttributes;

  if (
    (searchValue && searchValue.length > 0) ||
    Object.keys(filtersValues).length > 0
  ) {
    icon = <SearchSlash />;
    title = "No results found";
    description = "Try adjusting your search filters";
    actions = [];
  }

  return (
    <Empty>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          {map(actions, (action, index) => {
            const variant = index > 0 ? "outline" : undefined;
            return (
              <Button
                key={action.action}
                variant={variant}
                onClick={() => onActionClicked(action.action)}
              >
                {action.text}
              </Button>
            );
          })}
        </div>
      </EmptyContent>
    </Empty>
  );
}
