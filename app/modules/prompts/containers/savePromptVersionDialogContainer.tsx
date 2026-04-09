import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import SavePromptVersionDialog from "../components/savePromptVersionDialog";

export default function SavePromptVersionDialogContainer({
  userPrompt,
  annotationSchema,
  team,
  promptId,
  onSaveClicked,
  onAcceptChangesClicked,
}: {
  userPrompt: string;
  annotationSchema: any;
  team: string;
  promptId: string;
  onSaveClicked: () => void;
  onAcceptChangesClicked: (changes: {
    suggestedPrompt: string;
    suggestedAnnotationSchema: [];
  }) => void;
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
  const isMatching = fetcher.data?.alignmentScore >= 0.8;
  const isSubmitButtonDisabled = !isMatching || !!error;
  const reasoning = fetcher.data?.reasoning ?? "";
  const suggestedPrompt = fetcher.data?.prompt || "";
  const suggestedAnnotationSchema = fetcher.data?.annotationSchema || {};

  return (
    <SavePromptVersionDialog
      error={error}
      reasoning={reasoning}
      suggestedPrompt={suggestedPrompt}
      suggestedAnnotationSchema={suggestedAnnotationSchema}
      isSubmitButtonDisabled={isSubmitButtonDisabled}
      isFetching={isFetching}
      isMatching={isMatching}
      onSaveClicked={onSaveClicked}
      onAcceptChangesClicked={onAcceptChangesClicked}
    />
  );
}
