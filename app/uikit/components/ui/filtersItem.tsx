import { cn } from '@/lib/utils';
import map from 'lodash/map';
import { Check, ChevronDown, CircleX } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import type { Filter } from "./filters";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./select";

const FiltersItem = ({
  filter,
  value,
  onFiltersValueChanged,
}: { filter: Filter, value: string | undefined, onFiltersValueChanged?: (filterKeyAndValue: {}) => any }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (filter.options.length > 4) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between h-4">
          <Label htmlFor="width">{filter.text}</Label>
          {(value) && (
            <Button
              variant="link"
              size={"sm"}
              className="text-[10px] p-0 h-auto"
              onClick={() => {
                if (onFiltersValueChanged) {
                  onFiltersValueChanged({ [filter.category]: null })
                }
              }}
            >
              Clear<CircleX className="size-3" />
            </Button>
          )}
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="justify-between font-normal"
            >
              {value
                ? filter.options.find((option) => option.value === value)?.text
                : "--"}
              <ChevronDown className="opacity-30" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className=" p-0">
            <Command>
              <CommandInput placeholder={`Search...`} className="h-9" />
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {map(filter.options, (option) => {
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        keywords={[option.text]}
                        onSelect={(filterValue) => {
                          setIsOpen(false);
                          if (onFiltersValueChanged) {
                            onFiltersValueChanged({ [filter.category]: filterValue })
                          }
                        }}
                      >
                        {option.text}
                        <Check
                          className={cn(
                            "ml-auto",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between h-4">
          <Label htmlFor="width">{filter.text}</Label>
          {(value) && (
            <Button
              variant="link"
              size={"sm"}
              className="text-[10px] p-0 h-auto"
              onClick={() => {
                if (onFiltersValueChanged) {
                  onFiltersValueChanged({ [filter.category]: null })
                }
              }}
            >
              Clear<CircleX className="size-3" />
            </Button>
          )}
        </div>
        <div className="relative">

          <Select value={value ? value : ""} onValueChange={(filterValue) => {
            if (onFiltersValueChanged) {
              onFiltersValueChanged({ [filter.category]: filterValue })
            }
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="--" aria-label={value} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {map(filter.options, (option) => {
                  return (
                    <SelectItem key={option.value} value={option.value}>{option.text}</SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex justify-end absolute right-0">

          </div>
        </div>
      </div>
    );
  }
}

export default FiltersItem;
