import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Job } from "../queues.types";
import JobDetailField from "./jobDetailField";

interface DeleteJobDialogProps {
  job: Job;
  onRemoveJobClicked: (jobId: string) => void;
  isSubmitting?: boolean;
}

export default function DeleteJobDialog({ job, onRemoveJobClicked, isSubmitting = false }: DeleteJobDialogProps) {
  const handleDelete = () => {
    if (!isSubmitting) {
      onRemoveJobClicked(job.id);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Remove Job</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove this job from the queue? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <JobDetailField label="Job Name" value={job.name} />

      <JobDetailField
        label="Job ID"
        value={job.id}
        valueClassName="font-mono"
      />

      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
            Remove Job
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
