import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const StopRunDialog = ({
  onStopRunClicked,
}: {
  onStopRunClicked: () => void;
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Stop run</DialogTitle>
        <DialogDescription>
          Sessions currently being annotated will finish, but remaining sessions
          will be skipped.
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
            onClick={onStopRunClicked}
          >
            Stop run
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default StopRunDialog;
