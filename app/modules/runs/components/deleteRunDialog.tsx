import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { Run } from "~/modules/runs/runs.types";

const DeleteRunDialog = ({
  run,
  onDeleteRunClicked,
  isSubmitting = false,
}: {
  run: Run;
  onDeleteRunClicked: (runId: string) => void;
  isSubmitting?: boolean;
}) => {
  const [runName, setRunName] = useState("");

  const isDeleteButtonDisabled = runName !== run.name;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete run - {run.name}</DialogTitle>
        <DialogDescription>
          This will only remove the run. Sessions in the project will remain.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name">To confirm delete, type in the run name.</Label>
        <div className="relative">
          <Input
            className="absolute top-0 left-0"
            placeholder={run.name}
            disabled={true}
            autoComplete="off"
          />
          <Input
            className="focus-visible:border-destructive focus-visible:ring-destructive/50"
            id="name"
            name="name"
            value={runName}
            autoComplete="off"
            onChange={(event) => setRunName(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setRunName("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isDeleteButtonDisabled || isSubmitting}
            variant="destructive"
            onClick={() => {
              onDeleteRunClicked(run._id);
              setRunName("");
            }}
          >
            Delete run
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteRunDialog;
