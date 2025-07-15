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

const SavePromptVersionDialog = ({
  onSaveClicked
}: { onSaveClicked: () => void }) => {

  let isSubmitButtonDisabled = false;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save prompt version</DialogTitle>
        <DialogDescription>
          Are you sure you want to save this prompt version? Saving this version will stop edits from being made to this version. You can always create a new prompt version.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" disabled={isSubmitButtonDisabled} onClick={() => {
            onSaveClicked();
          }}>
            Save version
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default SavePromptVersionDialog;