import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

export default function EvaluationCreateRunsSelector({
  runs,
  baseRun,
  compatibleRuns,
  selectedRuns,
  onBaseRunChanged,
  onSelectedRunsChanged,
}: {
  runs: Array<{ _id: string; name: string }>;
  baseRun: string | null;
  compatibleRuns: Array<{ _id: string; name: string }>;
  selectedRuns: string[];
  onBaseRunChanged: (id: string | null) => void;
  onSelectedRunsChanged: (ids: string[]) => void;
}) {
  return (
    <div className="max-w-6xl">
      <div className="space-y-2">
        <Label>Select your runs for evaluation</Label>

        <div className="rounded-md border">
          <div className="grid grid-cols-2">
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
            <div className="p-4">
              <Label className="text-muted-foreground text-xs tracking-wide uppercase">
                Compatible runs
              </Label>
              {baseRun && compatibleRuns.length > 0 && (
                <ItemGroup className="mt-3 gap-2">
                  {compatibleRuns.map((run) => (
                    <Item
                      key={run._id}
                      variant="muted"
                      size="sm"
                      className="hover:bg-accent cursor-pointer"
                      onClick={() => {
                        if (selectedRuns.includes(run._id)) {
                          onSelectedRunsChanged(
                            selectedRuns.filter((id) => id !== run._id),
                          );
                        } else {
                          onSelectedRunsChanged([...selectedRuns, run._id]);
                        }
                      }}
                    >
                      <Checkbox
                        id={`right-${run._id}`}
                        checked={selectedRuns.includes(run._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onSelectedRunsChanged([...selectedRuns, run._id]);
                          } else {
                            onSelectedRunsChanged(
                              selectedRuns.filter((id) => id !== run._id),
                            );
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <ItemContent>
                        <ItemTitle>{run.name}</ItemTitle>
                      </ItemContent>
                    </Item>
                  ))}
                </ItemGroup>
              )}
              {baseRun && compatibleRuns.length === 0 && (
                <Empty className="mt-3">
                  <EmptyHeader>
                    <EmptyTitle>No compatible runs</EmptyTitle>
                    <EmptyDescription>
                      No other runs share the same sessions as the selected base
                      run.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              {!baseRun && (
                <Empty className="mt-3">
                  <EmptyHeader>
                    <EmptyTitle>No base run selected</EmptyTitle>
                    <EmptyDescription>
                      Select a base run to see other compatible runs to base
                      your evaluations on.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
