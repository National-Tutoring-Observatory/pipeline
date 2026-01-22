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
import TeamNameAlert from "./teamNameAlert";

const CreateTeamDialog = ({
  onCreateNewTeamClicked,
}: {
  onCreateNewTeamClicked: (name: string) => void;
}) => {
  const [name, setName] = useState("");

  const onTeamNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  let isSubmitButtonDisabled = true;

  if (name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a new team</DialogTitle>
        <DialogDescription>
          Give your team a name. This can be changed at a later date but giving
          a description now will make it easier to find later.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Name</Label>
        <Input
          id="name-1"
          name="name"
          defaultValue={name}
          autoComplete="off"
          onChange={onTeamNameChanged}
        />
        <TeamNameAlert name={name} />
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
              onCreateNewTeamClicked(name);
            }}
          >
            Create team
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateTeamDialog;
