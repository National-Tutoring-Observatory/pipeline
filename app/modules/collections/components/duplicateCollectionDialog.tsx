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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CollectionNameAlert from "./collectionNameAlert";
import type { Collection } from "~/modules/collections/collections.types";

const DuplicateCollectionDialog = ({
  collection,
  onDuplicateNewCollectionClicked,
}: {
  collection: Collection;
  onDuplicateNewCollectionClicked: ({
    name,
    collectionId,
  }: {
    name: string;
    collectionId: string;
  }) => void;
}) => {
  const [name, setName] = useState(`${collection.name} (duplicate)`);

  const onCollectionNameChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setName(event.target.value);
  };

  let isSubmitButtonDisabled = true;

  if (name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Duplicate a new collection</DialogTitle>
        <DialogDescription>
          Give your collection a name. This can be changed at a later date but
          giving a description now will make it easier to find later. Then
          select how you would like to collection the annotations over the
          session data.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={name}
          autoComplete="off"
          onChange={onCollectionNameChanged}
        />
        <CollectionNameAlert name={name} />
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isSubmitButtonDisabled}
            onClick={() => {
              onDuplicateNewCollectionClicked({
                name,
                collectionId: collection._id,
              });
            }}
          >
            Duplicate
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DuplicateCollectionDialog;
