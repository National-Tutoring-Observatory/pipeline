import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import getRunDisabledReason from "~/modules/evaluations/helpers/getRunDisabledReason";
import type { Run } from "~/modules/runs/runs.types";

export default function EvaluationCreateCompatibleRunsSelector({
  baseRun,
  compatibleRuns,
  selectedRuns,
  onSelectedRunsChanged,
}: {
  baseRun: string | null;
  compatibleRuns: Run[];
  selectedRuns: string[];
  onSelectedRunsChanged: (ids: string[]) => void;
}) {
  return (
    <div className="p-4">
      <Label className="text-muted-foreground text-xs tracking-wide uppercase">
        Compatible runs
      </Label>
      {baseRun && compatibleRuns.length > 0 && (
        <ItemGroup className="mt-3 gap-2">
          {compatibleRuns.map((run) => {
            const disabledReason = getRunDisabledReason(run);
            return (
              <Item
                key={run._id}
                variant="muted"
                size="sm"
                className={
                  disabledReason
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-accent cursor-pointer"
                }
                onClick={
                  disabledReason
                    ? undefined
                    : () => {
                        if (selectedRuns.includes(run._id)) {
                          onSelectedRunsChanged(
                            selectedRuns.filter((id) => id !== run._id),
                          );
                        } else {
                          onSelectedRunsChanged([...selectedRuns, run._id]);
                        }
                      }
                }
              >
                <Checkbox
                  id={`right-${run._id}`}
                  checked={selectedRuns.includes(run._id)}
                  disabled={!!disabledReason}
                  onCheckedChange={(checked) => {
                    if (disabledReason) return;
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
                  {disabledReason && (
                    <ItemDescription>{disabledReason}</ItemDescription>
                  )}
                </ItemContent>
              </Item>
            );
          })}
        </ItemGroup>
      )}
      {baseRun && compatibleRuns.length === 0 && (
        <Empty className="mt-3">
          <EmptyHeader>
            <EmptyTitle>No compatible runs</EmptyTitle>
            <EmptyDescription>
              No other runs share the same sessions as the selected base run.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {!baseRun && (
        <Empty className="mt-3">
          <EmptyHeader>
            <EmptyTitle>No base run selected</EmptyTitle>
            <EmptyDescription>
              Select a base run to see other compatible runs to base your
              evaluations on.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
