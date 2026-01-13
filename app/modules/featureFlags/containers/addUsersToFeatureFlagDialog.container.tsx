import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import AddUsersToFeatureFlagDialog from "../components/addUsersToFeatureFlagDialog";
import includes from 'lodash/includes';
import remove from 'lodash/remove';
import cloneDeep from "lodash/cloneDeep";

export default function AddUsersToFeatureFlagDialogContainer({
  featureFlagId,
  onAddUsersClicked,
  isSubmitting = false
}: {
  featureFlagId: string,
  onAddUsersClicked: (userIds: string[]) => void,
  isSubmitting?: boolean
}) {
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load(`/api/availableFeatureFlagUsers?featureFlagId=${featureFlagId}`);
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

  return (
    <AddUsersToFeatureFlagDialog
      isFetching={isFetching}
      isSubmitButtonDisabled={isSubmitButtonDisabled || isSubmitting}
      users={fetcher.data?.data}
      selectedUsers={selectedUsers}
      onAddUsersClicked={() => onAddUsersClicked(selectedUsers)}
      onSelectUserToggled={onSelectUserToggled}
      isSubmitting={isSubmitting}
    />
  );
}