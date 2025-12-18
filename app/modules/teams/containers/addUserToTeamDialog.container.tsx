import cloneDeep from "lodash/cloneDeep";
import includes from 'lodash/includes';
import remove from 'lodash/remove';
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { User } from "~/modules/users/users.types";
import AddUserToTeamDialog from "../components/addUserToTeamDialog";

export default function AddUserToTeamDialogContainer({
  teamId,
  onAddUsersClicked,
}: {
  teamId: string,
  onAddUsersClicked: (userIds: string[]) => void,
}) {

  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetcher = useFetcher();

  useEffect(() => {
    const params = new URLSearchParams({
      teamId,
      searchValue,
      currentPage: currentPage.toString()
    });
    fetcher.load(`/api/availableTeamUsers?${params.toString()}`);
  }, [teamId, searchValue, currentPage]);

  const onSelectUserToggled = (userId: string) => {
    let clonedSelectedUsers = cloneDeep(selectedUsers);
    if (includes(clonedSelectedUsers, userId)) {
      clonedSelectedUsers = remove(clonedSelectedUsers, userId);
      setSelectedUsers(clonedSelectedUsers);
    } else {
      clonedSelectedUsers.push(userId);
      setSelectedUsers(clonedSelectedUsers);
    }
    setIsSubmitButtonDisabled(clonedSelectedUsers.length === 0);
  }

  const onSearchValueChanged = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  }

  const onPaginationChanged = (page: number) => {
    setCurrentPage(page);
  }

  const users = (fetcher.data?.data || []) as User[];
  const totalPages = fetcher.data?.totalPages || 1;

  return (
    <AddUserToTeamDialog
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      users={users}
      selectedUsers={selectedUsers}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={totalPages}
      onAddUsersClicked={() => onAddUsersClicked(selectedUsers)}
      onSelectUserToggled={onSelectUserToggled}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
    />
  );
}
