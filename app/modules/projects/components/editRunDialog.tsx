import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RunNameAlert from "./runNameAlert";
import type { Run } from "~/modules/runs/runs.types";

const EditRunDialog = ({
  run,
  onEditRunClicked,
}: {
  run: Run;
  onEditRunClicked: (run: Run) => void;
}) => {
  const [updatedRun, setUpdatedRun] = useState(run);

  const onRunNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedRun({ ...updatedRun, name: event.target.value });
  };

  let isSubmitButtonDisabled = true;

  if (updatedRun?.name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit run</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={updatedRun.name}
          autoComplete="off"
          onChange={onRunNameChanged}
        />
        <RunNameAlert name={updatedRun.name} />
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
              onEditRunClicked(updatedRun);
            }}
          >
            Save run
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditRunDialog;
