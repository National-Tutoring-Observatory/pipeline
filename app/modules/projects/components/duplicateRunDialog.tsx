import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RunNameAlert from "./runNameAlert";
import type { Run } from "~/modules/runs/runs.types";

const DuplicateRunDialog = ({
  run,
  onDuplicateNewRunClicked
}: { run: Run, onDuplicateNewRunClicked: ({ name, runId }: { name: string, runId: string }) => void }) => {

  const [name, setName] = useState(`${run.name} (duplicate)`);

  const onRunNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  let isSubmitButtonDisabled = true;

  if (name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Duplicate a new run</DialogTitle>
        <DialogDescription>
          Give your run a name. This can be changed at a later date but giving a description now will make it easier to find later. Then select how you would like to run the annotations over the session data.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} autoComplete="off" onChange={onRunNameChanged} />
        <RunNameAlert
          name={name}
        />
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" disabled={isSubmitButtonDisabled} onClick={() => {
            onDuplicateNewRunClicked({ name, runId: run._id });
          }}>
            Duplicate
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DuplicateRunDialog;