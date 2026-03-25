import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import type { TopPerformer } from "../helpers/getTopPerformersVsGoldLabel";

export default function AdjudicationDialog({
  performers,
  selectedRuns,
  onSelectedRunsChanged,
  onStartAdjudication,
}: {
  performers: TopPerformer[];
  selectedRuns: string[];
  onSelectedRunsChanged: (ids: string[]) => void;
  onStartAdjudication: () => void;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Improve via adjudication</DialogTitle>
        <DialogDescription>
          Select the top performing runs you would like to include in the
          adjudication.
        </DialogDescription>
      </DialogHeader>

      <ItemGroup className="gap-2">
        {performers.map((performer) => (
          <Item
            key={performer.runId}
            variant="muted"
            size="sm"
            className="hover:bg-accent cursor-pointer"
            onClick={() => {
              if (selectedRuns.includes(performer.runId)) {
                onSelectedRunsChanged(
                  selectedRuns.filter((id) => id !== performer.runId),
                );
              } else {
                onSelectedRunsChanged([...selectedRuns, performer.runId]);
              }
            }}
          >
            <Checkbox
              id={`adjudication-${performer.runId}`}
              checked={selectedRuns.includes(performer.runId)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSelectedRunsChanged([...selectedRuns, performer.runId]);
                } else {
                  onSelectedRunsChanged(
                    selectedRuns.filter((id) => id !== performer.runId),
                  );
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <ItemContent>
              <ItemTitle>
                {performer.runName}
                <span className="text-muted-foreground ml-2 text-xs">
                  Kappa: {performer.kappa.toFixed(3)}
                </span>
              </ItemTitle>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>

      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={selectedRuns.length === 0}
            onClick={onStartAdjudication}
          >
            Start adjudication
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
