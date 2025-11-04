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

interface DeleteJobDialogProps {
  job: Job;
  onRemoveJobClicked: (jobId: string) => void;
}

export default function DeleteJobDialog({ job, onRemoveJobClicked }: DeleteJobDialogProps) {
  const handleDelete = () => {
    onRemoveJobClicked(job.id);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Remove Job</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove this job from the queue? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Name</label>
          <p className="text-sm text-muted-foreground">{job.name}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Job ID</label>
          <p className="text-sm text-muted-foreground font-mono">{job.id}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">State</label>
          <p className="text-sm text-muted-foreground capitalize">{job.state}</p>
        </div>
      </div>

      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Remove Job
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
