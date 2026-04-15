import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SaveCodebookVersionDialog = ({
  onSaveClicked,
}: {
  onSaveClicked: () => void;
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save codebook version</DialogTitle>
        <DialogDescription>
          Are you sure you want to save this codebook version? Saving this
          version will stop edits from being made to this version. You can
          always create a new codebook version.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" onClick={onSaveClicked}>
            Save version
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default SaveCodebookVersionDialog;
