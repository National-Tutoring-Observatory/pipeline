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
import ProjectNameAlert from "./projectNameAlert";
import TeamsSelectorContainer from "~/modules/teams/containers/teamsSelector.container";

const CreateProjectDialog = ({
  hasTeamSelection,
  onCreateNewProjectClicked
}: {
  hasTeamSelection: boolean,
  onCreateNewProjectClicked: ({ name, team }: { name: string, team: string | null }) => void
}) => {

  const [name, setName] = useState('');
  const [team, setTeam] = useState<string | null>(null);

  const onProjectNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onTeamSelected = (selectedTeam: string) => {
    setTeam(selectedTeam);
  }

  let isSubmitButtonDisabled = true;

  if (name.trim().length >= 3) {
    if (hasTeamSelection) {
      if (team) {
        isSubmitButtonDisabled = false;
      }
    } else {
      isSubmitButtonDisabled = false;
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a new project</DialogTitle>
        <DialogDescription>
          Give your project a name. This can be changed at a later date but giving a description now will make it easier to find later.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Name</Label>
        <Input id="name-1" name="name" defaultValue={name} autoComplete="off" onChange={onProjectNameChanged} />
        <ProjectNameAlert
          name={name}
        />
      </div>
      {(hasTeamSelection) && (
        <div className="grid gap-3">
          <Label htmlFor="name-1">Team</Label>
          <TeamsSelectorContainer
            team={team}
            onTeamSelected={onTeamSelected}
          />
        </div>
      )}
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" disabled={isSubmitButtonDisabled} onClick={() => {
            onCreateNewProjectClicked({ name, team });
          }}>
            Create project
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateProjectDialog;