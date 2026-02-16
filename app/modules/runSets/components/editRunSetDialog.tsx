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
import RunSetNameAlert from "./runSetNameAlert";

const EditRunSetDialog = ({
  runSet,
  onEditRunSetClicked,
}: {
  runSet: RunSet;
  onEditRunSetClicked: (runSet: RunSet) => void;
}) => {
  const [updatedRunSet, setUpdatedRunSet] = useState(runSet);

  const onRunSetNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedRunSet({ ...updatedRunSet, name: event.target.value });
  };

  let isSubmitButtonDisabled = true;

  if (updatedRunSet?.name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit run set</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={updatedRunSet.name}
          autoComplete="off"
          onChange={onRunSetNameChanged}
        />
        <RunSetNameAlert name={updatedRunSet.name} />
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
            disabled={isSubmitButtonDisabled}
            onClick={() => {
              onEditRunSetClicked(updatedRunSet);
            }}
          >
            Save run set
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditRunSetDialog;
