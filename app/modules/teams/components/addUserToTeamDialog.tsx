import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoaderPinwheel } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import map from 'lodash/map';
import includes from 'lodash/includes';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AddUserToTeamDialog({
  users,
  selectedUsers,
  isFetching,
  isSubmitButtonDisabled,
  onAddUsersClicked,
  onSelectUserToggled
}: {
  users: User[],
  selectedUsers: string[],
  isFetching: boolean,
  isSubmitButtonDisabled: boolean,
  onAddUsersClicked: () => void,
  onSelectUserToggled: (userId: string) => void,
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add a user to a team</DialogTitle>
        <DialogDescription>
          Select the users you would like to add to this team.
        </DialogDescription>
      </DialogHeader>
      <div>

        {(isFetching) && (
          <div className="flex items-center justify-center">
            <LoaderPinwheel className="animate-spin" />
          </div>
        )}
        {(!isFetching) && (
          <div>
            {map(users, (user) => {
              const isChecked = !!includes(selectedUsers, user._id);
              return (
                <div key={user._id} className="flex items-center gap-3 mb-2">
                  <Checkbox id={user._id} checked={isChecked} onCheckedChange={() => onSelectUserToggled(user._id)} />
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
          <Button type="button" disabled={isSubmitButtonDisabled} onClick={() => {
            onAddUsersClicked();
          }}>
            Add users
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent >
  );
}