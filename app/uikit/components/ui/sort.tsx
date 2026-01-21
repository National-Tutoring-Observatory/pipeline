import map from "lodash/map";
import { ArrowDownUp } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import SortItem from "./sortItem";

export type SortOption = {
  value: string;
  text: string;
};

export type FilterOption = {
  value: string;
  text: string;
};

export type SortProps = {
  sortOptions?: SortOption[];
  sortValue?: any;
  onSortValueChanged: (sortValue: string) => any;
};

const Sort = ({ sortOptions, sortValue, onSortValueChanged }: SortProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ArrowDownUp />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Sort by</h4>
            <p className="text-muted-foreground text-sm">
              Select an attribute to sort by
            </p>
          </div>
          <div className="grid gap-4">
            {map(sortOptions, (sortOption) => {
              return (
                <SortItem
                  key={sortOption.value}
                  item={sortOption}
                  value={sortValue}
                  onValueChange={onSortValueChanged}
                />
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Sort;
