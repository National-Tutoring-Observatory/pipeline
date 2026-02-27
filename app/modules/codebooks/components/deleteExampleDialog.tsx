import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DeleteExampleDialog = ({
  onDeleteClicked,
}: {
  onDeleteClicked: () => void;
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete example</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this example? This cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" variant="destructive" onClick={onDeleteClicked}>
            Delete example
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteExampleDialog;
