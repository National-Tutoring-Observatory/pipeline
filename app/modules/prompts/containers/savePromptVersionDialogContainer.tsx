import { useEffect, useRef } from "react";
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

  const isFetching = !fetcher.data;
  const isMatching = fetcher.data?.isMatching ?? false;
  const isSubmitButtonDisabled = !fetcher.data?.isMatching;
  const reasoning = fetcher.data?.reasoning ?? "";

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
