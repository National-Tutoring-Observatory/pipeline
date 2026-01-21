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
import type { Team } from "../teams.types";

const DeleteTeamDialog = ({
  team,
  onDeleteTeamClicked,
}: {
  team: Team;
  onDeleteTeamClicked: (id: string) => void;
}) => {
  const [teamName, setTeamName] = useState("");

  let isDeleteButtonDisabled = true;

  if (teamName === team.name) {
    isDeleteButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete team - {team.name}</DialogTitle>
        <DialogDescription>THIS ACTION IS IRREVERSIBLE.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">
          To confirm delete, type in the team name.
        </Label>
        <div className="relative">
          <Input
            className="absolute left-0 top-0"
            placeholder={team.name}
            disabled={true}
            autoComplete="off"
          />
          <Input
            className="focus-visible:border-destructive focus-visible:ring-destructive/50"
            id="name-1"
            name="name"
            value={teamName}
            autoComplete="off"
            onChange={(event) => setTeamName(event.target.value)}
          />
        </div>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setTeamName("");
            }}
          >
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isDeleteButtonDisabled}
            variant="destructive"
            onClick={() => {
              onDeleteTeamClicked(team._id);
              setTeamName("");
            }}
          >
            Delete team
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteTeamDialog;
