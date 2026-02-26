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
import type { Codebook } from "../codebooks.types";

const DeleteCodebookDialog = ({
  codebook,
  onDeleteCodebookClicked,
  isSubmitting = false,
}: {
  codebook: Codebook;
  onDeleteCodebookClicked: (id: string) => void;
  isSubmitting?: boolean;
}) => {
  const [codebookName, setCodebookName] = useState("");

  const isDeleteButtonDisabled = codebookName !== codebook.name || isSubmitting;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete codebook - {codebook.name}</DialogTitle>
        <DialogDescription>THIS ACTION IS IRREVERSIBLE.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">
          To confirm delete, type in the codebook name.
        </Label>
        <div className="relative">
          <Input
            className="absolute top-0 left-0"
            placeholder={codebook.name}
            disabled={true}
            autoComplete="off"
          />
          <Input
            className="focus-visible:border-destructive focus-visible:ring-destructive/50"
            id="name-1"
            name="name"
            value={codebookName}
            autoComplete="off"
            onChange={(event) => setCodebookName(event.target.value)}
          />
        </div>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCodebookName("");
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
              onDeleteCodebookClicked(codebook._id);
              setCodebookName("");
            }}
          >
            Delete codebook
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteCodebookDialog;
