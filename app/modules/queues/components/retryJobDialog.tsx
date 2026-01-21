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

interface RetryJobDialogProps {
  job: Job;
  onRetryJobClicked: (jobId: string) => void;
  isSubmitting?: boolean;
}

export default function RetryJobDialog({
  job,
  onRetryJobClicked,
  isSubmitting = false,
}: RetryJobDialogProps) {
  const handleRetry = () => {
    if (!isSubmitting) {
      onRetryJobClicked(job.id);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Retry Job</DialogTitle>
        <DialogDescription>
          Are you sure you want to retry this failed job? The job will be
          re-added to the queue and attempted again.
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
          <Button type="button" onClick={handleRetry} disabled={isSubmitting}>
            Retry Job
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
