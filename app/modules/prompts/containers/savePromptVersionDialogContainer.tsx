import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import SavePromptVersionDialog from "../components/savePromptVersionDialog";

export default function SavePromptVersionDialogContainer({
  userPrompt,
  annotationSchema,
  team,
  promptId,
  onSaveClicked,
}: {
  userPrompt: string;
  annotationSchema: any;
  team: string;
  promptId: string;
  onSaveClicked: () => void;
}) {
  const hasInitialized = useRef(false);

  const fetcher = useFetcher();

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetcher.submit(
        { userPrompt, annotationSchema, team, promptId },
        {
          action: "/api/promptVersionAlignment",
          method: "post",
          encType: "application/json",
        },
      );
    }
  }, []);

  const error = fetcher.data?.errors?.general ?? "";
  const isFetching = !fetcher.data;
  const isMatching = fetcher.data?.isMatching ?? false;
  const isSubmitButtonDisabled = !fetcher.data?.isMatching || !!error;
  const reasoning = fetcher.data?.reasoning ?? "";
  const suggestedPrompt = fetcher.data?.prompt;
  const suggestedAnnotationSchema = fetcher.data?.annotationSchema || {};

  console.log(suggestedAnnotationSchema);

  return (
    <SavePromptVersionDialog
      error={error}
      reasoning={reasoning}
      suggestedPrompt={suggestedPrompt}
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      isFetching={isFetching}
      isMatching={isMatching}
      onSaveClicked={onSaveClicked}
    />
  );
}
