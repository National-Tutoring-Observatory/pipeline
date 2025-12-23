import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import { closeDialog } from "~/modules/dialogs/addDialog";
import TeamsSelectorContainer from "~/modules/teams/containers/teamsSelector.container";
import ProjectNameAlert from "./projectNameAlert";

const CreateProjectDialog = ({
  hasTeamSelection,
  onCreateNewProjectClicked,
  actionData
}: {
  hasTeamSelection: boolean,
  onCreateNewProjectClicked: ({ name, team }: { name: string, team: string | null }) => void,
  actionData?: any
}) => {

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [team, setTeam] = useState<string | null>(null);

  useEffect(() => {
    if (fetcher.data && fetcher.data.intent === 'CREATE_PROJECT' && fetcher.data.data && fetcher.data.data._id) {
      // close the dialog and navigate to the new project
      try { closeDialog(); } catch (e) { /* ignore */ }
      navigate(`/projects/${fetcher.data.data._id}`);
    }
  }, [fetcher.data, navigate]);

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
          serverError={fetcher.data?.errors?.name ?? actionData?.errors?.name}
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
        <fetcher.Form method="post" action="/api/projects">
          <input type="hidden" name="intent" value="CREATE_PROJECT" />
          <input type="hidden" name="payload" value={JSON.stringify({ name, team })} />
          <Button type="submit" disabled={isSubmitButtonDisabled || fetcher.state === 'submitting'}>
            {fetcher.state === 'submitting' ? 'Creating…' : 'Create project'}
          </Button>
        </fetcher.Form>
      </DialogFooter>

    </DialogContent>
  );
};

export default CreateProjectDialog;
