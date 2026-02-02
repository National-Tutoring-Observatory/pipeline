import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Run } from "~/modules/runs/runs.types";

const RemoveRunFromCollectionDialog = ({
  run,
  onRemoveRunClicked,
  isSubmitting = false,
}: {
  run: Run;
  onRemoveRunClicked: (runId: string) => void;
  isSubmitting?: boolean;
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Remove run from collection</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove "{run.name}" from this collection? The
          run will not be deleted, only removed from this collection.
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
            disabled={isSubmitting}
            variant="destructive"
            onClick={() => {
              onRemoveRunClicked(run._id);
            }}
          >
            Remove
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default RemoveRunFromCollectionDialog;
