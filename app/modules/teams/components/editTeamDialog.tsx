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
import type { Team } from "../teams.types";
import TeamNameAlert from "./teamNameAlert";

const EditTeamDialog = ({
  team,
  onEditTeamClicked,
}: {
  team: Team;
  onEditTeamClicked: (team: Team) => void;
}) => {
  const [updatedTeam, setUpdatedTeam] = useState(team);

  const onTeamNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedTeam({ ...updatedTeam, name: event.target.value });
  };

  let isSubmitButtonDisabled = true;

  if (updatedTeam?.name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit team</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Name</Label>
        <Input
          id="name-1"
          name="name"
          defaultValue={updatedTeam.name}
          autoComplete="off"
          onChange={onTeamNameChanged}
        />
        <TeamNameAlert name={updatedTeam?.name} />
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
              onEditTeamClicked(updatedTeam);
            }}
          >
            Save team
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditTeamDialog;
