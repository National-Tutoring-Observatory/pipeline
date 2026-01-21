import { Button } from "@/components/ui/button";
import { Collection } from "@/components/ui/collection";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "~/modules/users/users.types";
import getAddUserToTeamDialogEmptyAttributes from "../helpers/getAddUserToTeamDialogEmptyAttributes";
import getAddUserToTeamDialogItemActions from "../helpers/getAddUserToTeamDialogItemActions";
import getAddUserToTeamDialogItemAttributes from "../helpers/getAddUserToTeamDialogItemAttributes";
import renderAddUserToTeamDialogItem from "../helpers/renderAddUserToTeamDialogItem";

export default function AddUserToTeamDialog({
  users,
  selectedUsers,
  searchValue,
  currentPage,
  totalPages,
  isSubmitButtonDisabled,
  onAddUsersClicked,
  onSelectUserToggled,
  onSearchValueChanged,
  onPaginationChanged,
}: {
  users: User[];
  selectedUsers: string[];
  searchValue: string;
  currentPage: number;
  totalPages: number;
  isSubmitButtonDisabled: boolean;
  onAddUsersClicked: () => void;
  onSelectUserToggled: (userId: string) => void;
  onSearchValueChanged: (searchValue: string) => void;
  onPaginationChanged: (page: number) => void;
}) {
  return (
    <DialogContent className="min-w-2xl">
      <DialogHeader>
        <DialogTitle>Add a user to a team</DialogTitle>
        <DialogDescription>
          Select the users you would like to add to this team.
        </DialogDescription>
      </DialogHeader>
      <div style={{ height: "calc(100vh - 200px)" }}>
        <Collection
          items={users}
          itemsLayout="list"
          hasSearch={true}
          hasPagination={true}
          searchValue={searchValue}
          currentPage={currentPage}
          totalPages={totalPages}
          filters={[]}
          filtersValues={{}}
          emptyAttributes={getAddUserToTeamDialogEmptyAttributes()}
          renderItem={(user: User) =>
            renderAddUserToTeamDialogItem(user, selectedUsers)
          }
          getItemAttributes={getAddUserToTeamDialogItemAttributes}
          getItemActions={getAddUserToTeamDialogItemActions}
          onItemClicked={onSelectUserToggled}
          onActionClicked={() => {}}
          onSearchValueChanged={onSearchValueChanged}
          onPaginationChanged={onPaginationChanged}
          onFiltersValueChanged={() => {}}
          onSortValueChanged={() => {}}
        />
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
