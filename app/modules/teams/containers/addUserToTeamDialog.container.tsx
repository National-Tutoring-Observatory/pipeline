import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import AddUserToTeamDialog from "../components/addUserToTeamDialog";

export default function AddUserToTeamDialogContainer({ }: {

}) {

  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
  // const [isMatching, setIsMatching] = useState(false);
  // const [reasoning, setReasoning] = useState('');
  // const hasInitialized = useRef(false);

  // const fetcher = useFetcher();

  // useEffect(() => {
  //   if (!hasInitialized.current) {
  //     hasInitialized.current = true;
  //     fetcher.submit({ userPrompt, annotationSchema }, {
  //       action: '/api/promptVersionAlignment',
  //       method: "post",
  //       encType: "application/json"
  //     });
  //   }
  // }, []);

  // useEffect(() => {
  //   if (fetcher.data) {
  //     setIsMatching(fetcher.data.isMatching);
  //     setIsFetching(false);
  //     if (fetcher.data.isMatching) {
  //       setIsSubmitButtonDisabled(false);
  //     } else {
  //       setReasoning(fetcher.data.reasoning);
  //     }
  //   }
  // }, [fetcher.data])

  const onAddUsersClicked = () => {

  }

  return (
    <AddUserToTeamDialog
      isFetching={isFetching}
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      // reasoning={reasoning}
      // isSubmitButtonDisabled={isSubmitButtonDisabled}
      // isFetching={isFetching}
      // isMatching={isMatching}
      onAddUsersClicked={onAddUsersClicked}
    />
  );
}