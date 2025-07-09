import type { CreateRun, Run } from "~/modules/runs/runs.types";
import { useEffect, useState } from "react";
import map from 'lodash/map';
import ProjectRunCreator from "../components/projectRunCreator";

export default function ProjectRunCreatorContainer({ run, onStartRunClicked }: {
  run: Run,
  onStartRunClicked: ({ selectedAnnotationType, selectedPrompt, selectedPromptVersion, selectedModel, selectedSessions }: CreateRun) => void
}) {

  const [selectedAnnotationType, setSelectedAnnotationType] = useState(run.annotationType);
  const [selectedPrompt, setSelectedPrompt] = useState(run.prompt as number | null);
  const [selectedPromptVersion, setSelectedPromptVersion] = useState(run.promptVersion as number | null);
  const [selectedModel, setSelectedModel] = useState(run.model || 'GEMINI');
  const [selectedSessions, setSelectedSessions] = useState<number[]>(map(run.sessions, 'sessionId'));
  const [isRunButtonDisabled, setIsRunButtonDisabled] = useState(true);

  const onSelectedAnnotationTypeChanged = (selectedAnnotationType: string) => {
    setSelectedPrompt(null);
    setSelectedPromptVersion(null);
    setSelectedAnnotationType(selectedAnnotationType);
  }

  const onSelectedPromptChanged = (selectedPrompt: number) => {
    setSelectedPrompt(selectedPrompt);
  }

  const onSelectedPromptVersionChanged = (selectedPromptVersion: number) => {
    setSelectedPromptVersion(selectedPromptVersion);
  }

  const onSelectedModelChanged = (selectedModel: string) => {
    setSelectedModel(selectedModel);
  }

  const onSelectedSessionsChanged = (selectedSessions: number[]) => {
    setSelectedSessions(selectedSessions);
  }

  const onStartRunButtonClicked = () => {
    onStartRunClicked({
      selectedAnnotationType,
      selectedPrompt,
      selectedPromptVersion,
      selectedModel,
      selectedSessions
    })
  }

  useEffect(() => {
    if (selectedPrompt && selectedPromptVersion && selectedSessions.length > 0) {
      setIsRunButtonDisabled(false);
    }
  }, [selectedPrompt, selectedPromptVersion, selectedModel, selectedSessions]);

  return (
    <ProjectRunCreator
      selectedAnnotationType={selectedAnnotationType}
      selectedPrompt={selectedPrompt}
      selectedPromptVersion={selectedPromptVersion}
      selectedModel={selectedModel}
      selectedSessions={selectedSessions}
      isRunButtonDisabled={isRunButtonDisabled}
      onSelectedAnnotationTypeChanged={onSelectedAnnotationTypeChanged}
      onSelectedPromptChanged={onSelectedPromptChanged}
      onSelectedPromptVersionChanged={onSelectedPromptVersionChanged}
      onSelectedModelChanged={onSelectedModelChanged}
      onSelectedSessionsChanged={onSelectedSessionsChanged}
      onStartRunButtonClicked={onStartRunButtonClicked}
    />
  )
}