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
import type { Project } from "../projects.types";

const EditProjectDialog = ({
  project,
  onEditProjectClicked
}: { project: Project, onEditProjectClicked: (project: Project) => void }) => {

  const [updatedProject, setUpdatedProject] = useState(project);

  const onProjectNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedProject({ ...updatedProject, name: event.target.value });
  };

  let isSubmitButtonDisabled = true;

  if (updatedProject?.name.trim().length >= 3) {
    isSubmitButtonDisabled = false;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit project</DialogTitle>
        <DialogDescription>

        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Name</Label>
        <Input id="name-1" name="name" defaultValue={updatedProject.name} autoComplete="off" onChange={onProjectNameChanged} />
        <ProjectNameAlert
          name={updatedProject?.name}
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
            onEditProjectClicked(updatedProject);
          }}>
            Save project
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditProjectDialog;