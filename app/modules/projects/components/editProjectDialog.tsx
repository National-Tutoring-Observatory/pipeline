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
import type { Project } from "../projects.types";
import ProjectNameAlert from "./projectNameAlert";

const EditProjectDialog = ({
  project,
  onEditProjectClicked,
  isSubmitting = false,
}: {
  project: Project;
  onEditProjectClicked: (project: Project) => void;
  isSubmitting?: boolean;
}) => {
  const [updatedProject, setUpdatedProject] = useState(project);

  const onProjectNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedProject({ ...updatedProject, name: event.target.value });
  };

  let isSubmitButtonDisabled =
    isSubmitting || updatedProject?.name.trim().length < 3;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit project</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">Name</Label>
        <Input
          id="name-1"
          name="name"
          defaultValue={updatedProject.name}
          autoComplete="off"
          onChange={onProjectNameChanged}
          disabled={isSubmitting}
        />
        <ProjectNameAlert name={updatedProject?.name} />
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isSubmitButtonDisabled}
            onClick={() => {
              onEditProjectClicked(updatedProject);
            }}
          >
            {isSubmitting ? "Saving..." : "Save project"}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditProjectDialog;
