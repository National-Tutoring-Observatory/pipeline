import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

export default function EvaluationCreateBaseRunSelector({
  runs,
  baseRun,
  onBaseRunChanged,
}: {
  runs: Array<{ _id: string; name: string }>;
  baseRun: string | null;
  onBaseRunChanged: (id: string | null) => void;
}) {
  return (
    <div className="border-r p-4">
      <Label className="text-muted-foreground text-xs tracking-wide uppercase">
        Base run
      </Label>
      <ItemGroup className="mt-3 gap-2">
        {runs.map((run) => (
          <Item
            key={run._id}
            variant={baseRun === run._id ? "outline" : "default"}
            size="sm"
            className={
              baseRun === run._id
                ? "cursor-pointer"
                : "hover:bg-accent cursor-pointer"
            }
            onClick={() => onBaseRunChanged(run._id)}
          >
            <ItemContent>
              <ItemTitle>{run.name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ChevronRight className="text-muted-foreground size-4" />
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
