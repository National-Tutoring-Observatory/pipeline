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
import type { Collection } from "~/modules/collections/collections.types";

const DeleteCollectionDialog = ({
  collection,
  onDeleteCollectionClicked,
  isSubmitting = false,
}: {
  collection: Collection;
  onDeleteCollectionClicked: (collectionId: string) => void;
  isSubmitting?: boolean;
}) => {
  const [collectionName, setCollectionName] = useState("");

  const isDeleteButtonDisabled = collectionName !== collection.name;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete collection - {collection.name}</DialogTitle>
        <DialogDescription>
          This will only remove the collection. The runs and sessions will
          remain in the project.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name">
          To confirm delete, type in the collection name.
        </Label>
        <div className="relative">
          <Input
            className="absolute top-0 left-0"
            placeholder={collection.name}
            disabled={true}
            autoComplete="off"
          />
          <Input
            className="focus-visible:border-destructive focus-visible:ring-destructive/50"
            id="name"
            name="name"
            value={collectionName}
            autoComplete="off"
            onChange={(event) => setCollectionName(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCollectionName("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isDeleteButtonDisabled || isSubmitting}
            variant="destructive"
            onClick={() => {
              onDeleteCollectionClicked(collection._id);
              setCollectionName("");
            }}
          >
            Delete collection
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteCollectionDialog;
