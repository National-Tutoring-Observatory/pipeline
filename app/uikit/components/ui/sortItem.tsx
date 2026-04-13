import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import { Label } from "./label";
import type { SortOption } from "./sort";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const SortItem = ({
  item,
  value,
  onValueChange,
}: {
  item: SortOption;
  value: string;
  onValueChange: (value: string) => void;
}) => {
  return (
    <div className="flex justify-between">
      <Label>{item.text}</Label>
      <ToggleGroup
        type="single"
        size="sm"
        variant={"outline"}
        value={value}
        onValueChange={(value) => {
          if (value) {
            onValueChange(value);
          }
        }}
      >
        <ToggleGroupItem
          value={item.value}
          aria-label={`Sort by ${item.text} ascending`}
        >
          <ArrowDownWideNarrow />
        </ToggleGroupItem>
        <ToggleGroupItem
          value={`-${item.value}`}
          aria-label={`Sort by ${item.text} descending`}
        >
          <ArrowUpWideNarrow />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default SortItem;
