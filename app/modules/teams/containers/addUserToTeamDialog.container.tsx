import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { User } from "~/modules/users/users.types";
import AddUserToTeamDialog from "../components/addUserToTeamDialog";
import type { TeamRole } from "../teams.types";

export default function AddUserToTeamDialogContainer({
  teamId,
  onAddUsersClicked,
}: {
  teamId: string;
  onAddUsersClicked: (users: Array<{ userId: string; role: TeamRole }>) => void;
}) {
  const [selectedUsers, setSelectedUsers] = useState<Record<string, TeamRole>>(
    {},
  );
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetcher = useFetcher();

  useEffect(() => {
    const params = new URLSearchParams({
      teamId,
      searchValue,
      currentPage: currentPage.toString(),
    });
    fetcher.load(`/api/availableTeamUsers?${params.toString()}`);
  }, [teamId, searchValue, currentPage]);

  const onSelectUserToggled = (userId: string) => {
    setSelectedUsers((prev) => {
      if (userId in prev) {
        const { [userId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [userId]: "MEMBER" };
    });
  };

  const onUserRoleChanged = (userId: string, role: TeamRole) => {
    setSelectedUsers((prev) => ({ ...prev, [userId]: role }));
  };

  const onSearchValueChanged = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const onPaginationChanged = (page: number) => {
    setCurrentPage(page);
  };

  const users = (fetcher.data?.data || []) as User[];
  const totalPages = fetcher.data?.totalPages || 1;
  const selectedCount = Object.keys(selectedUsers).length;

  return (
    <AddUserToTeamDialog
      users={users}
      selectedUsers={selectedUsers}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={totalPages}
      isSubmitButtonDisabled={selectedCount === 0}
      onAddUsersClicked={() =>
        onAddUsersClicked(
          Object.entries(selectedUsers).map(([userId, role]) => ({
            userId,
            role,
          })),
        )
      }
      onSelectUserToggled={onSelectUserToggled}
      onUserRoleChanged={onUserRoleChanged}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
    />
  );
}
