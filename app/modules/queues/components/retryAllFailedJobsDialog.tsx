import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RetryAllFailedJobsDialogProps {
  onRetryAllClicked: () => void;
  isSubmitting: boolean;
}

export default function RetryAllFailedJobsDialog({
  onRetryAllClicked,
  isSubmitting,
}: RetryAllFailedJobsDialogProps) {
  const handleRetryAll = () => {
    if (!isSubmitting) {
      onRetryAllClicked();
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Retry All Failed Jobs</DialogTitle>
        <DialogDescription>
          Are you sure you want to retry all failed jobs? Each job will be
          re-added to the queue and attempted again.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            onClick={handleRetryAll}
            disabled={isSubmitting}
          >
            Retry All
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
