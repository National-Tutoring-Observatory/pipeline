import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  inviteName: string;
  onConfirm: () => void;
}

export default function ConfirmRevokeInviteDialog({
  inviteName,
  onConfirm,
}: Props) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Revoke this invite link?</DialogTitle>
        <DialogDescription>
          "{inviteName}" will stop working immediately. This cannot be undone.
          The record (and anyone who already signed up) is preserved for audit.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Revoke
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
