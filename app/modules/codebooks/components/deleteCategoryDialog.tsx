import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DeleteCategoryDialog = ({
  categoryName,
  onDeleteClicked,
}: {
  categoryName: string;
  onDeleteClicked: () => void;
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Delete category - {categoryName || "Untitled"}
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this category? All codes and examples
          within it will be removed. This cannot be undone.
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
            Delete category
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteCategoryDialog;
