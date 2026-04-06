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
import getAddUsersToFeatureFlagDialogEmptyAttributes from "../helpers/getAddUsersToFeatureFlagDialogEmptyAttributes";
import getAddUsersToFeatureFlagDialogItemActions from "../helpers/getAddUsersToFeatureFlagDialogItemActions";
import getAddUsersToFeatureFlagDialogItemAttributes from "../helpers/getAddUsersToFeatureFlagDialogItemAttributes";
import renderAddUsersToFeatureFlagDialogItem from "../helpers/renderAddUsersToFeatureFlagDialogItem";

export default function AddUsersToFeatureFlagDialog({
  users,
  selectedUsers,
  searchValue,
  currentPage,
  totalPages,
  isSubmitButtonDisabled,
  onAddUsersClicked,
  onSelectUserToggled,
  isSyncing,
  onSearchValueChanged,
  onPaginationChanged,
  isSubmitting = false,
}: {
  users: User[];
  selectedUsers: string[];
  searchValue: string;
  currentPage: number;
  totalPages: number;
  isSubmitButtonDisabled: boolean;
  onAddUsersClicked: () => void;
  onSelectUserToggled: (userId: string) => void;
  isSyncing: boolean;
  onSearchValueChanged: (searchValue: string) => void;
  onPaginationChanged: (page: number) => void;
  isSubmitting?: boolean;
}) {
  return (
    <DialogContent className="min-w-2xl">
      <DialogHeader>
        <DialogTitle>Add a user to a feature flag</DialogTitle>
        <DialogDescription>
          Adding a user to a feature flag will enable early preview to this
          feature.
        </DialogDescription>
      </DialogHeader>
      <div className="h-[calc(100vh-200px)] overflow-y-auto">
        <Collection
          items={users}
          itemsLayout="list"
          hasSearch={true}
          hasPagination={true}
          isSyncing={isSyncing}
          searchValue={searchValue}
          currentPage={currentPage}
          totalPages={totalPages}
          filters={[]}
          filtersValues={{}}
          emptyAttributes={getAddUsersToFeatureFlagDialogEmptyAttributes()}
          renderItem={(user: User) =>
            renderAddUsersToFeatureFlagDialogItem(user, selectedUsers)
          }
          getItemAttributes={getAddUsersToFeatureFlagDialogItemAttributes}
          getItemActions={getAddUsersToFeatureFlagDialogItemActions}
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
            disabled={isSubmitButtonDisabled || isSubmitting}
            onClick={() => {
              onAddUsersClicked();
            }}
          >
            {isSubmitting ? "Adding..." : "Add users"}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
