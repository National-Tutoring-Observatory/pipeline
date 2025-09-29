import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import AddUserToTeamDialog from "../components/addUserToTeamDialog";
import includes from 'lodash/includes';
import remove from 'lodash/remove';
import cloneDeep from "lodash/cloneDeep";

export default function AddUserToTeamDialogContainer({ teamId }: {
  teamId: string
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

  const onAddUsersClicked = () => {

  }

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

  return (
    <AddUserToTeamDialog
      isFetching={isFetching}
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      users={fetcher.data?.data}
      selectedUsers={selectedUsers}
      onAddUsersClicked={onAddUsersClicked}
      onSelectUserToggled={onSelectUserToggled}
    />
  );
}