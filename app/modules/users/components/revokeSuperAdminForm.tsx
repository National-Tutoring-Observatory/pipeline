import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "../users.types";

interface RevokeSuperAdminFormProps {
  targetUser: User;
  reason: string;
  isSubmitting: boolean;
  isSubmitButtonDisabled: boolean;
  onReasonChanged: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRevokeSuperAdminClicked: (reason: string) => void;
}

export default function RevokeSuperAdminForm({
  targetUser,
  reason,
  isSubmitting,
  isSubmitButtonDisabled,
  onReasonChanged,
  onRevokeSuperAdminClicked,
}: RevokeSuperAdminFormProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Revoke Super Admin Status</DialogTitle>
        <DialogDescription>
          Remove super admin privileges from a user. This action is audited and
          cannot be undone without explicit re-assignment.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-950 p-3 rounded text-sm">
          <div>
            <p className="text-xs text-red-600 dark:text-red-400">User:</p>
            <p className="font-medium mb-2">
              {targetUser.username || "Unknown User"}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              Current Role:
            </p>
            <p className="font-medium">{targetUser.role || "USER"}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="reason" className="text-sm mb-2 block">
            Reason for Revocation <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Explain why this user's super admin privileges are being revoked..."
            value={reason}
            onChange={onReasonChanged}
            className="min-h-24"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This will be recorded in the audit log for security purposes.
          </p>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          disabled={isSubmitButtonDisabled}
          onClick={() => onRevokeSuperAdminClicked(reason)}
          variant="destructive"
        >
          {isSubmitting ? "Revoking..." : "Revoke Super Admin"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
