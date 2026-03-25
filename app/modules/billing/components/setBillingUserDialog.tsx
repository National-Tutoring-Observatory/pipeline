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
import { useState } from "react";
import type { User } from "~/modules/users/users.types";

interface SetBillingUserDialogProps {
  members: User[];
  currentBillingUserId?: string;
  searchValue: string;
  currentPage: number;
  totalPages: number;
  onSetBillingUserClicked: (userId: string) => void;
  onSearchValueChanged: (value: string) => void;
  onPaginationChanged: (page: number) => void;
}

const SetBillingUserDialog = ({
  members,
  currentBillingUserId,
  searchValue,
  currentPage,
  totalPages,
  onSetBillingUserClicked,
  onSearchValueChanged,
  onPaginationChanged,
}: SetBillingUserDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState(
    currentBillingUserId ?? "",
  );

  return (
    <DialogContent className="min-w-2xl">
      <DialogHeader>
        <DialogTitle>Set billing user</DialogTitle>
        <DialogDescription>
          The billing user can manage credits and spending limits for this team.
        </DialogDescription>
      </DialogHeader>
      <div style={{ height: "calc(100vh - 300px)" }}>
        <Collection
          items={members}
          itemsLayout="list"
          hasSearch
          hasPagination
          searchValue={searchValue}
          currentPage={currentPage}
          totalPages={totalPages}
          filters={[]}
          filtersValues={{}}
          emptyAttributes={{ title: "No members found" }}
          getItemAttributes={(member: User) => ({
            id: member._id,
            title: member.name || member.username,
            description: [member.email, member.username]
              .filter(Boolean)
              .join(" · "),
            isSelected: member._id === selectedUserId,
          })}
          getItemActions={() => []}
          onItemClicked={(userId: string) => setSelectedUserId(userId)}
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
            disabled={
              !selectedUserId || selectedUserId === currentBillingUserId
            }
            onClick={() => onSetBillingUserClicked(selectedUserId)}
          >
            Save
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default SetBillingUserDialog;
