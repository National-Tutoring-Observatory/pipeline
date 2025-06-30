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
import ProjectNameAlert from "./projectNameAlert";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import RunNameAlert from "./runNameAlert";

const CreateRunDialog = ({
  onCreateNewRunClicked
}: { onCreateNewRunClicked: ({ name, annotationType }: { name: string, annotationType: string }) => void }) => {

  const [name, setName] = useState('');
  const [annotationType, setAnnotationType] = useState('PER_UTTERANCE');

  const onProjectNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  let isSubmitButtonDisabled = true;

  if (name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a new run</DialogTitle>
        <DialogDescription>
          Give your run a name. This can be changed at a later date but giving a description now will make it easier to find later. Then select how you would like to run the annotations over the session data.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Name</Label>
        <Input id="name-1" name="name" defaultValue={name} autoComplete="off" onChange={onProjectNameChanged} />
        <RunNameAlert
          name={name}
        />
        <Label htmlFor="name-1">Annotation type</Label>
        <Select
          value={annotationType}
          onValueChange={(annotationType) => {
            setAnnotationType(annotationType);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an annotation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PER_UTTERANCE">Per utterance</SelectItem>
            <SelectItem value="PER_SESSION">Per session</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" disabled={isSubmitButtonDisabled} onClick={() => {
            onCreateNewRunClicked({ name, annotationType });
          }}>
            Continue
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default CreateRunDialog;