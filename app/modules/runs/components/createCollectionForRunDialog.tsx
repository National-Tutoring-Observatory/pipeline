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
import CollectionNameAlert from "~/modules/collections/components/collectionNameAlert";

const CreateCollectionForRunDialog = ({
  onCreateCollectionClicked,
}: {
  onCreateCollectionClicked: (name: string) => void;
}) => {
  const [name, setName] = useState("");

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const isSubmitButtonDisabled = name.trim().length < 3;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new collection</DialogTitle>
        <DialogDescription>
          A new collection will be created containing this run.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="collectionName">Name</Label>
        <Input
          id="collectionName"
          name="collectionName"
          autoComplete="off"
          onChange={onNameChanged}
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
              onCreateCollectionClicked(name);
            }}
          >
            Create collection
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateCollectionForRunDialog;
