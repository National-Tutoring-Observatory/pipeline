import map from "lodash/map";
import { FilterIcon } from "lucide-react";
import type { ReactElement } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import FiltersItem from "./filtersItem";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type Filter = {
  icon?: ReactElement;
  category: string;
  text: string;
  options: FilterOption[];
};

export type FilterOption = {
  value: string;
  text: string;
};

export type FiltersProps = {
  filters: Filter[];
  filtersValues: any;
  onFiltersValueChanged?: (filtersValue: {}) => any;
};

const Filters = ({
  filters,
  filtersValues = {},
  onFiltersValueChanged,
}: FiltersProps) => {
  const hasAtLeastOneFilter = Object.values(filtersValues).some(
    (value) => value !== null,
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <FilterIcon />
          {hasAtLeastOneFilter && (
            <Badge className="bg-blue-500 text-white dark:bg-blue-600 absolute top-1 right-1 h-1.5 w-1.5 p-0" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Filters</h4>
            <p className="text-muted-foreground text-sm">
              Set the filters to apply to your search.
            </p>
          </div>
          <div className="grid gap-8">
            {map(filters, (filter, index) => {
              return (
                <FiltersItem
                  key={filter.category}
                  filter={filter}
                  value={filtersValues[filter.category]}
                  onFiltersValueChanged={onFiltersValueChanged}
                />
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Filters;
