import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const StopRunSetDialog = ({
  onStopRunSetClicked,
}: {
  onStopRunSetClicked: () => void;
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Stop all runs</DialogTitle>
        <DialogDescription>
          All active runs in this run set will be stopped. Sessions currently
          being annotated will finish, but remaining sessions will be skipped.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            variant="destructive"
            onClick={onStopRunSetClicked}
          >
            Stop all runs
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default StopRunSetDialog;
