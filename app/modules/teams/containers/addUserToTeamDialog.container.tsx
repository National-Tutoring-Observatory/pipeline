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
  superAdminId
}: {
  teamId: string,
  superAdminId: string | null,
  onAddUsersClicked: (userIds: string[]) => void,
}) {

  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load(`/api/availableTeamUsers?teamId=${teamId}`);
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setIsFetching(false);
    }
  }, [fetcher.data])

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

  const users = (fetcher.data?.data || []) as User[];
  const availableUsers = superAdminId ? users.filter((user) => user._id !== superAdminId) : users;

  return (
    <AddUserToTeamDialog
      isFetching={isFetching}
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      users={availableUsers}
      selectedUsers={selectedUsers}
      onAddUsersClicked={() => onAddUsersClicked(selectedUsers)}
      onSelectUserToggled={onSelectUserToggled}
    />
  );
}
