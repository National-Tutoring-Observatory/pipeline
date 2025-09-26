import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import AddUserToTeamDialog from "../components/addUserToTeamDialog";

export default function AddUserToTeamDialogContainer({ teamId }: {
  teamId: string
}) {

  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
  // const [isMatching, setIsMatching] = useState(false);
  // const [reasoning, setReasoning] = useState('');
  // const hasInitialized = useRef(false);

  const fetcher = useFetcher();

  useEffect(() => {
    // const queryParams = new URLSearchParams();
    //queryParams.set('project', params.projectId || "");
    fetcher.load(`/api/availableTeamUsers?teamId=${teamId}`);
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setIsFetching(false);
    }
  }, [fetcher.data])

  const onAddUsersClicked = () => {

  }

  console.log(fetcher);

  return (
    <AddUserToTeamDialog
      isFetching={isFetching}
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      users={fetcher.data?.data}
      // reasoning={reasoning}
      // isSubmitButtonDisabled={isSubmitButtonDisabled}
      // isFetching={isFetching}
      // isMatching={isMatching}
      onAddUsersClicked={onAddUsersClicked}
    />
  );
}