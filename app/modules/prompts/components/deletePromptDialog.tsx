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
import type { Prompt } from "../prompts.types";

const DeletePromptDialog = ({
  prompt,
  onDeletePromptClicked,
  isSubmitting = false
}: { prompt: Prompt, onDeletePromptClicked: (id: string) => void, isSubmitting?: boolean }) => {

  const [promptName, setPromptName] = useState('');

  let isDeleteButtonDisabled = true;

  if (promptName === prompt.name && !isSubmitting) {
    isDeleteButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete prompt - {prompt.name}</DialogTitle>
        <DialogDescription>
          THIS ACTION IS IRREVERSIBLE.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">To confirm delete, type in the prompt name.</Label>
        <div className="relative">
          <Input className="absolute left-0 top-0" placeholder={prompt.name} disabled={true} autoComplete="off" />
          <Input className="focus-visible:border-destructive focus-visible:ring-destructive/50" id="name-1" name="name" value={promptName} autoComplete="off" onChange={(event) => setPromptName(event.target.value)} />
        </div>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary" onClick={() => {
            setPromptName('');
          }}>
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" disabled={isDeleteButtonDisabled} variant="destructive" onClick={() => {
            onDeletePromptClicked(prompt._id);
            setPromptName('');
          }}>
            Delete prompt
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeletePromptDialog;