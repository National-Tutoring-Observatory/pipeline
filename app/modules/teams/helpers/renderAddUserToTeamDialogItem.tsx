import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { User } from "~/modules/users/users.types";

export default function renderAddUserToTeamDialogItem(
  user: User,
  selectedUsers: string[],
) {
  const isChecked = selectedUsers.includes(user._id);
  return (
    <div className="flex items-center gap-3 p-3">
      <Checkbox id={`user-${user._id}`} checked={isChecked} />
      <div className="flex-1 cursor-pointer">
        <Label htmlFor={`user-${user._id}`} className="cursor-pointer">
          {user.name || user.username}
        </Label>
        <p className="text-muted-foreground pt-1 text-xs">
          {user.email} · {user.username}
        </p>
      </div>
    </div>
  );
}
