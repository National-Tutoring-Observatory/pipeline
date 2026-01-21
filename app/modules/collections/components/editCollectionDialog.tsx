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
import CollectionNameAlert from "./collectionNameAlert";

const EditCollectionDialog = ({
  collection,
  onEditCollectionClicked,
}: {
  collection: Collection;
  onEditCollectionClicked: (collection: Collection) => void;
}) => {
  const [updatedCollection, setUpdatedCollection] = useState(collection);

  const onCollectionNameChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUpdatedCollection({ ...updatedCollection, name: event.target.value });
  };

  let isSubmitButtonDisabled = true;

  if (updatedCollection?.name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit collection</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={updatedCollection.name}
          autoComplete="off"
          onChange={onCollectionNameChanged}
        />
        <CollectionNameAlert name={updatedCollection.name} />
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
              onEditCollectionClicked(updatedCollection);
            }}
          >
            Save collection
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditCollectionDialog;
