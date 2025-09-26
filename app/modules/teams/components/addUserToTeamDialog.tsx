import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoaderPinwheel } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import map from 'lodash/map';

export default function AddUserToTeamDialog({
  users,
  isFetching,
  isSubmitButtonDisabled,
  onAddUsersClicked
}: {
  users: User[],
  isFetching: boolean,
  isSubmitButtonDisabled: boolean,
  onAddUsersClicked: () => void
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
              return (
                <div key={user._id}>
                  {user.username}
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