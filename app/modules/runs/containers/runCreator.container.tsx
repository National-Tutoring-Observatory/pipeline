import map from "lodash/map";
import sampleSize from "lodash/sampleSize";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import aiGatewayConfig from "~/config/ai_gateway.json";
import type { CreateRun, Run } from "~/modules/runs/runs.types";
import RunCreator from "../components/runCreator";

interface RunCreatorContainerProps {
  onStartRunClicked: (createRun: CreateRun) => void;
  isSubmitting: boolean;
  initialRun?: Run | null;
}

export default function ProjectRunCreatorContainer({
  onStartRunClicked,
  isSubmitting,
  initialRun,
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
  const [randomSampleSize, setRandomSampleSize] = useState(0);
  const [isRunButtonDisabled, setIsRunButtonDisabled] = useState(true);

  const sessionsFetcher = useFetcher({ key: "sessionsList" });

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

  const onRandomSampleSizeChanged = (randomSampleSize: number) => {
    setRandomSampleSize(randomSampleSize);
  };

  const onSelectRandomSampleSizeButtonClicked = () => {
    const randomSessions = sampleSize(
      map(sessionsFetcher.data.sessions.data, "_id"),
      randomSampleSize,
    );
    setSelectedSessions(randomSessions);
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
    });
  };

  useEffect(() => {
    if (
      selectedPrompt &&
      selectedPromptVersion &&
      selectedSessions.length > 0
    ) {
      setIsRunButtonDisabled(false);
    }
  }, [selectedPrompt, selectedPromptVersion, selectedModel, selectedSessions]);

  useEffect(() => {
    if (sessionsFetcher.data && sessionsFetcher.data.sessions) {
      setRandomSampleSize(Math.floor(sessionsFetcher.data.sessions.count / 3));
    }
  }, [sessionsFetcher.data]);

  return (
    <RunCreator
      runName={runName}
      selectedAnnotationType={selectedAnnotationType}
      selectedPrompt={selectedPrompt}
      selectedPromptVersion={selectedPromptVersion}
      selectedModel={selectedModel}
      selectedSessions={selectedSessions}
      randomSampleSize={randomSampleSize}
      sessionsCount={sessionsFetcher?.data?.sessions?.count || 0}
      isSubmitting={isSubmitting}
      isRunButtonDisabled={isRunButtonDisabled || isSubmitting}
      onRunNameChanged={onRunNameChangedHandler}
      onSelectedAnnotationTypeChanged={onSelectedAnnotationTypeChanged}
      onSelectedPromptChanged={onSelectedPromptChanged}
      onSelectedPromptVersionChanged={onSelectedPromptVersionChanged}
      onSelectedModelChanged={onSelectedModelChanged}
      onSelectedSessionsChanged={onSelectedSessionsChanged}
      onStartRunButtonClicked={onStartRunButtonClicked}
      onRandomSampleSizeChanged={onRandomSampleSizeChanged}
      onSelectRandomSampleSizeButtonClicked={
        onSelectRandomSampleSizeButtonClicked
      }
    />
  );
}
