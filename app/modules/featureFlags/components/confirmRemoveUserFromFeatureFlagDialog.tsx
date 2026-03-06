import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmRemoveUserFromFeatureFlagDialogProps {
  onConfirm: () => void;
}

export default function ConfirmRemoveUserFromFeatureFlagDialog({
  onConfirm,
}: ConfirmRemoveUserFromFeatureFlagDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Remove user from feature flag?</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove this user from the feature flag?
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
