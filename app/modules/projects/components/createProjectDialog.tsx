import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";

const CreateProjectDialog = ({
  onCreateNewProjectClicked
}: { onCreateNewProjectClicked: (name: string) => void }) => {

  const [name, setName] = useState('');

  const onProjectNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Create a project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Give your project a name. This can be changed at a later date but giving a description now will make it easier to find later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Label htmlFor="name-1">Name</Label>
          <Input id="name-1" name="name" defaultValue={name} onChange={onProjectNameChanged} />
          {(name.length === 0) && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Project name is required</AlertTitle>
            </Alert>
          )}
        </div>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" disabled={name.length === 0} onClick={() => onCreateNewProjectClicked(name)}>
              Create project
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;