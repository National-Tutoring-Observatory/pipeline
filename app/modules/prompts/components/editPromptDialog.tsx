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
import type { Prompt } from "../prompts.types";

const EditPromptDialog = ({
  prompt,
  onEditPromptClicked
}: { prompt: Prompt, onEditPromptClicked: (prompt: Prompt) => void }) => {

  const [updatedPrompt, setUpdatedPrompt] = useState(prompt);

  const onPromptNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedPrompt({ ...updatedPrompt, name: event.target.value });
  };

  let isSubmitButtonDisabled = true;

  if (updatedPrompt?.name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit prompt</DialogTitle>
        <DialogDescription>

        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Name</Label>
        <Input id="name-1" name="name" defaultValue={updatedPrompt.name} autoComplete="off" onChange={onPromptNameChanged} />
        <PromptNameAlert
          name={updatedPrompt?.name}
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
            onEditPromptClicked(updatedPrompt);
          }}>
            Save prompt
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditPromptDialog;