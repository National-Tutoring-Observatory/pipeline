import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmRemoveUserDialogProps {
  onConfirm: () => void;
}

export default function ConfirmRemoveUserDialog({ onConfirm }: ConfirmRemoveUserDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Remove user from team?</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove this user from the team? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Remove
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
