import { useMemo, useState } from "react";
import { getDefaultModelCode } from "~/modules/llm/modelRegistry";
import type { CreateRun, Run } from "~/modules/runs/runs.types";
import { calculateEstimates } from "~/modules/runSets/helpers/calculateEstimates";
import useCreditAcknowledgment from "~/modules/runSets/hooks/useCreditAcknowledgment";
import type { SessionData } from "~/modules/sessions/sessions.types";
import RunCreator from "../components/runCreator";

interface RunCreatorContainerProps {
  onStartRunClicked: (createRun: CreateRun) => void;
  isSubmitting: boolean;
  initialRun?: Run | null;
  duplicateWarnings?: string[];
  avgSecondsPerSession: number | null;
  outputToInputRatio: number | null;
  balance: number;
}

export default function ProjectRunCreatorContainer({
  onStartRunClicked,
  isSubmitting,
  initialRun,
  duplicateWarnings = [],
  avgSecondsPerSession,
  outputToInputRatio,
  balance,
}: RunCreatorContainerProps) {
  const [runName, setRunName] = useState(
    initialRun ? `${initialRun.name} (copy)` : "",
  );
  const [selectedAnnotationType, setSelectedAnnotationType] = useState(
    initialRun?.annotationType || "PER_UTTERANCE",
  );
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(
    (initialRun?.prompt as string) || null,
  );
  const [selectedPromptVersion, setSelectedPromptVersion] = useState<
    number | null
  >(initialRun?.promptVersion || null);
  const [selectedPromptInputTokens, setSelectedPromptInputTokens] = useState<
    number | undefined
  >(undefined);
  const [selectedModel, setSelectedModel] = useState(
    initialRun?.snapshot?.model?.code || getDefaultModelCode(),
  );
  const [selectedSessions, setSelectedSessions] = useState<SessionData[]>(
    initialRun?.sessions?.map((s) => ({ _id: s.sessionId })) || [],
  );
  const [shouldRunVerification, setShouldRunVerification] = useState(
    initialRun?.shouldRunVerification ?? false,
  );
  const onSelectedAnnotationTypeChanged = (selectedAnnotationType: string) => {
    setSelectedPrompt(null);
    setSelectedPromptVersion(null);
    setSelectedAnnotationType(selectedAnnotationType);
  };

  const onSelectedPromptChanged = (selectedPrompt: string) => {
    setSelectedPrompt(selectedPrompt);
    setSelectedPromptInputTokens(undefined);
  };

  const onSelectedPromptVersionChanged = (
    selectedPromptVersion: number,
    inputTokens?: number,
  ) => {
    setSelectedPromptVersion(selectedPromptVersion);
    setSelectedPromptInputTokens(inputTokens);
  };

  const onSelectedModelChanged = (selectedModel: string) => {
    setSelectedModel(selectedModel);
  };

  const selectedSessionIds = selectedSessions.map((s) => s._id);

  const onSelectedSessionsChanged = (sessions: SessionData[]) => {
    setSelectedSessions(sessions);
  };

  const estimation = useMemo(
    () =>
      calculateEstimates(
        [
          {
            modelCode: selectedModel,
            prompt: { inputTokens: selectedPromptInputTokens },
          },
        ],
        selectedSessions,
        {
          shouldRunVerification,
          avgSecondsPerSession,
          outputToInputRatio,
        },
      ),
    [
      selectedModel,
      selectedSessions,
      shouldRunVerification,
      avgSecondsPerSession,
      outputToInputRatio,
      selectedPromptInputTokens,
    ],
  );

  const creditAcknowledgment = useCreditAcknowledgment(
    estimation.estimatedCost,
    balance,
  );

  const onStartRunButtonClicked = () => {
    onStartRunClicked({
      name: runName,
      selectedAnnotationType,
      selectedPrompt,
      selectedPromptVersion,
      selectedModel,
      selectedSessions: selectedSessionIds,
      shouldRunVerification,
      acknowledgedInsufficientCredits: creditAcknowledgment.acknowledged,
    });
  };

  const isRunButtonDisabled =
    !(
      runName.trim().length >= 3 &&
      selectedPrompt &&
      selectedPromptVersion &&
      selectedSessionIds.length > 0
    ) ||
    (creditAcknowledgment.exceedsBalance && !creditAcknowledgment.acknowledged);

  return (
    <RunCreator
      duplicateWarnings={duplicateWarnings}
      runName={runName}
      selectedAnnotationType={selectedAnnotationType}
      selectedPrompt={selectedPrompt}
      selectedPromptVersion={selectedPromptVersion}
      selectedModel={selectedModel}
      selectedSessions={selectedSessionIds}
      estimation={estimation}
      balance={balance}
      creditAcknowledgment={creditAcknowledgment}
      isSubmitting={isSubmitting}
      isRunButtonDisabled={isRunButtonDisabled || isSubmitting}
      onRunNameChanged={setRunName}
      onSelectedAnnotationTypeChanged={onSelectedAnnotationTypeChanged}
      onSelectedPromptChanged={onSelectedPromptChanged}
      onSelectedPromptVersionChanged={onSelectedPromptVersionChanged}
      onSelectedModelChanged={onSelectedModelChanged}
      onSelectedSessionsChanged={onSelectedSessionsChanged}
      shouldRunVerification={shouldRunVerification}
      onShouldRunVerificationChanged={setShouldRunVerification}
      onStartRunButtonClicked={onStartRunButtonClicked}
    />
  );
}
