import { useState } from "react";
import aiGatewayConfig from "~/config/ai_gateway.json";
import type { CreateRun, Run } from "~/modules/runs/runs.types";
import RunCreator from "../components/runCreator";

interface RunCreatorContainerProps {
  onStartRunClicked: (createRun: CreateRun) => void;
  isSubmitting: boolean;
  initialRun?: Run | null;
  duplicateWarnings?: string[];
}

export default function ProjectRunCreatorContainer({
  onStartRunClicked,
  isSubmitting,
  initialRun,
  duplicateWarnings = [],
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
  const [selectedModel, setSelectedModel] = useState(
    initialRun?.snapshot?.model?.code || aiGatewayConfig.defaultModel,
  );
  const [selectedSessions, setSelectedSessions] = useState<string[]>(
    initialRun?.sessions?.map((s) => s.sessionId) || [],
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
  };

  const onSelectedPromptVersionChanged = (selectedPromptVersion: number) => {
    setSelectedPromptVersion(selectedPromptVersion);
  };

  const onSelectedModelChanged = (selectedModel: string) => {
    setSelectedModel(selectedModel);
  };

  const onSelectedSessionsChanged = (selectedSessions: string[]) => {
    setSelectedSessions(selectedSessions);
  };

  const onRunNameChangedHandler = (name: string) => {
    setRunName(name);
  };

  const onStartRunButtonClicked = () => {
    onStartRunClicked({
      name: runName,
      selectedAnnotationType,
      selectedPrompt,
      selectedPromptVersion,
      selectedModel,
      selectedSessions,
      shouldRunVerification,
    });
  };

  const isRunButtonDisabled = !(
    selectedPrompt &&
    selectedPromptVersion &&
    selectedSessions.length > 0
  );

  return (
    <RunCreator
      duplicateWarnings={duplicateWarnings}
      runName={runName}
      selectedAnnotationType={selectedAnnotationType}
      selectedPrompt={selectedPrompt}
      selectedPromptVersion={selectedPromptVersion}
      selectedModel={selectedModel}
      selectedSessions={selectedSessions}
      isSubmitting={isSubmitting}
      isRunButtonDisabled={isRunButtonDisabled || isSubmitting}
      onRunNameChanged={onRunNameChangedHandler}
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
