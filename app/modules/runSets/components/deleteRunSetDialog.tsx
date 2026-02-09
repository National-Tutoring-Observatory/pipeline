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
import type { RunSet } from "~/modules/runSets/runSets.types";

const DeleteRunSetDialog = ({
  runSet,
  onDeleteRunSetClicked,
  isSubmitting = false,
}: {
  runSet: RunSet;
  onDeleteRunSetClicked: (runSetId: string) => void;
  isSubmitting?: boolean;
}) => {
  const [runSetName, setRunSetName] = useState("");

  const isDeleteButtonDisabled = runSetName !== runSet.name;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete run set - {runSet.name}</DialogTitle>
        <DialogDescription>
          This will only remove the run set. The runs and sessions will remain
          in the project.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name">
          To confirm delete, type in the run set name.
        </Label>
        <div className="relative">
          <Input
            className="absolute top-0 left-0"
            placeholder={runSet.name}
            disabled={true}
            autoComplete="off"
          />
          <Input
            className="focus-visible:border-destructive focus-visible:ring-destructive/50"
            id="name"
            name="name"
            value={runSetName}
            autoComplete="off"
            onChange={(event) => setRunSetName(event.target.value)}
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
              setRunSetName("");
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
              onDeleteRunSetClicked(runSet._id);
              setRunSetName("");
            }}
          >
            Delete run set
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteRunSetDialog;
