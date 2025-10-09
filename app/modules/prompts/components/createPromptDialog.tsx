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
import PromptNameAlert from "./promptNameAlert";
import TeamsSelectorContainer from "~/modules/teams/containers/teamsSelector.container";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CreatePromptDialog = ({
  hasTeamSelection,
  onCreateNewPromptClicked
}: {
  hasTeamSelection: boolean,
  onCreateNewPromptClicked: ({
    name,
    annotationType,
    team
  }: {
    name: string,
    annotationType: string,
    team: string | null
  }) => void
}) => {

  const [name, setName] = useState('');
  const [annotationType, setAnnotationType] = useState('PER_UTTERANCE');
  const [team, setTeam] = useState<string | null>(null);

  const onPromptNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        <DialogTitle>Create a new prompt</DialogTitle>
        <DialogDescription>
          Give your prompt a name. This can be changed at a later date but giving a description now will make it easier to find later.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Name</Label>
        <Input id="name-1" name="name" defaultValue={name} autoComplete="off" onChange={onPromptNameChanged} />
        <PromptNameAlert
          name={name}
        />
        <Label htmlFor="annotation-type">Annotation type</Label>
        <Select
          value={annotationType}
          onValueChange={(annotationType) => {
            setAnnotationType(annotationType);
          }}
        >
          <SelectTrigger id="annotation-type" className="w-[180px]">
            <SelectValue placeholder="Select an annotation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PER_UTTERANCE">Per utterance</SelectItem>
            <SelectItem value="PER_SESSION">Per session</SelectItem>
          </SelectContent>
        </Select>
        {(hasTeamSelection) && (
          <div className="grid gap-3">
            <Label htmlFor="name-1">Team</Label>
            <TeamsSelectorContainer
              team={team}
              onTeamSelected={onTeamSelected}
            />
          </div>
        )}
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" disabled={isSubmitButtonDisabled} onClick={() => {
            onCreateNewPromptClicked({ name, team, annotationType });
          }}>
            Create prompt
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreatePromptDialog;