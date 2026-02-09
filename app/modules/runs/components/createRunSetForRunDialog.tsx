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
import RunSetNameAlert from "~/modules/runSets/components/runSetNameAlert";

const CreateRunSetForRunDialog = ({
  onCreateRunSetClicked,
}: {
  onCreateRunSetClicked: (name: string) => void;
}) => {
  const [name, setName] = useState("");

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const isSubmitButtonDisabled = name.trim().length < 3;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new run set</DialogTitle>
        <DialogDescription>
          A new run set will be created containing this run.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="runSetName">Name</Label>
        <Input
          id="runSetName"
          name="runSetName"
          autoComplete="off"
          onChange={onNameChanged}
        />
        <RunSetNameAlert name={name} />
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
              onCreateRunSetClicked(name);
            }}
          >
            Create run set
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateRunSetForRunDialog;
