import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Run } from '~/modules/runs/runs.types';

interface AddRunsDialogProps {
  eligibleRuns: Run[];
  onAddRunsClicked: (runIds: string[]) => void;
}

export default function AddRunsDialog({
  eligibleRuns,
  onAddRunsClicked
}: AddRunsDialogProps) {
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);

  const onSelectAllToggled = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedRunIds(eligibleRuns.map(run => run._id));
    } else {
      setSelectedRunIds([]);
    }
  };

  const onSelectRunToggled = (runId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRunIds([...selectedRunIds, runId]);
    } else {
      setSelectedRunIds(selectedRunIds.filter(id => id !== runId));
    }
  };

  const isSubmitDisabled = selectedRunIds.length === 0;

  if (eligibleRuns.length === 0) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Runs</DialogTitle>
          <DialogDescription>
            No eligible runs found. Runs must have the same sessions and annotation type as the collection.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Add Runs to Collection</DialogTitle>
        <DialogDescription>
          Select runs to add to this collection. Only runs with matching sessions and annotation type are shown.
        </DialogDescription>
      </DialogHeader>
      <div className="border rounded-md max-h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={selectedRunIds.length === eligibleRuns.length && eligibleRuns.length > 0}
                  onCheckedChange={(checked) => onSelectAllToggled(Boolean(checked))}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eligibleRuns.map((run) => (
              <TableRow key={run._id}>
                <TableCell className="w-8">
                  <Checkbox
                    checked={selectedRunIds.includes(run._id)}
                    onCheckedChange={(checked) => onSelectRunToggled(run._id, Boolean(checked))}
                  />
                </TableCell>
                <TableCell className="font-medium">{run.name}</TableCell>
                <TableCell>{run.snapshot?.model?.name || run.model || '--'}</TableCell>
                <TableCell>
                  {run.isComplete ? 'Complete' : run.isRunning ? 'Running' : 'Pending'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        {selectedRunIds.length} of {eligibleRuns.length} runs selected
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isSubmitDisabled}
            onClick={() => onAddRunsClicked(selectedRunIds)}
          >
            Add {selectedRunIds.length} Run{selectedRunIds.length !== 1 ? 's' : ''}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
