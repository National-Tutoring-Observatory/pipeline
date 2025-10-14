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

const CreateFeatureFlagDialog = ({
  onCreateNewFeatureFlagClicked
}: {
  onCreateNewFeatureFlagClicked: ({ name }: { name: string }) => void
}) => {

  const [name, setName] = useState('');

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  let isSubmitButtonDisabled = true;

  if (name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a new feature flag</DialogTitle>
        <DialogDescription>
          Give your feature flag a name. This should be all capitalised, start with 'HAS_' and use underscores for spaces. E.g. 'HAS_AI_PROMPT_BUILDER'
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Feature flag</Label>
        <Input id="name-1" name="name" defaultValue={name} autoComplete="off" onChange={onNameChanged} />
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" disabled={isSubmitButtonDisabled} onClick={() => {
            onCreateNewFeatureFlagClicked({ name });
          }}>
            Create feature flag
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateFeatureFlagDialog;