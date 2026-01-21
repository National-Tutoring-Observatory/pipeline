import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import includes from "lodash/includes";
import map from "lodash/map";
import { LoaderPinwheel } from "lucide-react";
import type { User } from "~/modules/users/users.types";

export default function AddUsersToFeatureFlagDialog({
  users,
  selectedUsers,
  isFetching,
  isSubmitButtonDisabled,
  onAddUsersClicked,
  onSelectUserToggled,
  isSubmitting = false,
}: {
  users: User[];
  selectedUsers: string[];
  isFetching: boolean;
  isSubmitButtonDisabled: boolean;
  onAddUsersClicked: () => void;
  onSelectUserToggled: (userId: string) => void;
  isSubmitting?: boolean;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add a user to a feature flag</DialogTitle>
        <DialogDescription>
          Adding a user to a feature flag will enable early preview to this
          feature.
        </DialogDescription>
      </DialogHeader>
      <div>
        {isFetching && (
          <div className="flex items-center justify-center">
            <LoaderPinwheel className="animate-spin" />
          </div>
        )}
        {!isFetching && (
          <div>
            {map(users, (user) => {
              const isChecked = !!includes(selectedUsers, user._id);
              return (
                <div key={user._id} className="mb-2 flex items-center gap-3">
                  <Checkbox
                    id={user._id}
                    checked={isChecked}
                    onCheckedChange={() => onSelectUserToggled(user._id)}
                  />
                  <Label htmlFor={user._id}>{user.username}</Label>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isSubmitButtonDisabled}
            onClick={() => {
              onAddUsersClicked();
            }}
          >
            Add users
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
