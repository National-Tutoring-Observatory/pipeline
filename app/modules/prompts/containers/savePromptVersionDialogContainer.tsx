import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import SavePromptVersionDialog from "../components/savePromptVersionDialog";

export default function SavePromptVersionDialogContainer({
  userPrompt,
  annotationSchema,
  team,
  onSaveClicked,
}: {
  userPrompt: string;
  annotationSchema: any;
  team: string;
  onSaveClicked: () => void;
}) {
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [reasoning, setReasoning] = useState("");
  const hasInitialized = useRef(false);

  const fetcher = useFetcher();

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetcher.submit(
        { userPrompt, annotationSchema, team },
        {
          action: "/api/promptVersionAlignment",
          method: "post",
          encType: "application/json",
        },
      );
    }
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setIsMatching(fetcher.data.isMatching);
      setIsFetching(false);
      if (fetcher.data.isMatching) {
        setIsSubmitButtonDisabled(false);
      } else {
        setReasoning(fetcher.data.reasoning);
      }
    }
  }, [fetcher.data]);

  return (
    <SavePromptVersionDialog
      reasoning={reasoning}
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      isFetching={isFetching}
      isMatching={isMatching}
      onSaveClicked={onSaveClicked}
    />
  );
}
