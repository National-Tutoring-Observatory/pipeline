import type { CreateRun, Run } from "~/modules/runs/runs.types";
import { useEffect, useState } from "react";
import map from 'lodash/map';
import ProjectRunCreator from "../components/projectRunCreator";
import { useFetcher } from "react-router";
import sampleSize from "lodash/sampleSize";
import type { LLMSettings } from "~/core/llm/llm.types";
import { DEFAULT_LLM_SETTINGS } from "~/core/llm/llm.types";

// Helper functions for localStorage persistence
const getLLMSettingsFromStorage = (model: string): LLMSettings => {
  if (typeof window === 'undefined') return DEFAULT_LLM_SETTINGS;
  
  try {
    const saved = localStorage.getItem(`llm-settings-${model}`);
    if (saved) {
      return { ...DEFAULT_LLM_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load LLM settings from localStorage:', error);
  }
  return DEFAULT_LLM_SETTINGS;
};

const saveLLMSettingsToStorage = (model: string, settings: LLMSettings) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`llm-settings-${model}`, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save LLM settings to localStorage:', error);
  }
};

export default function ProjectRunCreatorContainer({ run, onStartRunClicked }: {
  run: Run,
  onStartRunClicked: (createRun: CreateRun) => void
}) {

  const [selectedAnnotationType, setSelectedAnnotationType] = useState(run.annotationType);
  const [selectedPrompt, setSelectedPrompt] = useState(run.prompt as number | null);
  const [selectedPromptVersion, setSelectedPromptVersion] = useState(run.promptVersion as number | null);
  const [selectedModel, setSelectedModel] = useState(run.model || 'GEMINI');
  const [selectedSessions, setSelectedSessions] = useState<number[]>(map(run.sessions, 'sessionId'));
  const [randomSampleSize, setRandomSampleSize] = useState(0);
  const [isRunButtonDisabled, setIsRunButtonDisabled] = useState(true);
  const [llmSettings, setLlmSettings] = useState<LLMSettings>(() => 
    getLLMSettingsFromStorage(run.model || 'GEMINI')
  );

  const sessionsFetcher = useFetcher({ key: 'sessionsList' });

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
    // Load settings for the new model
    const modelSettings = getLLMSettingsFromStorage(selectedModel);
    setLlmSettings(modelSettings);
    setSelectedModel(selectedModel);
  }

  const onSelectedSessionsChanged = (selectedSessions: number[]) => {
    setSelectedSessions(selectedSessions);
  }

  const onRandomSampleSizeChanged = (randomSampleSize: number) => {
    setRandomSampleSize(randomSampleSize);
  }

  const onSelectRandomSampleSizeButtonClicked = () => {
    const randomSessions = sampleSize(map(sessionsFetcher.data.sessions.data, '_id'), randomSampleSize);
    setSelectedSessions(randomSessions);
  }

  const onLLMSettingsChanged = (settings: LLMSettings) => {
    // Save settings for the current model
    saveLLMSettingsToStorage(selectedModel, settings);
    setLlmSettings(settings);
  }

  const onStartRunButtonClicked = () => {
    onStartRunClicked({
      selectedAnnotationType,
      selectedPrompt,
      selectedPromptVersion,
      selectedModel,
      selectedSessions,
      llmSettings
    })
  }

  useEffect(() => {
    if (selectedPrompt && selectedPromptVersion && selectedSessions.length > 0) {
      setIsRunButtonDisabled(false);
    }
  }, [selectedPrompt, selectedPromptVersion, selectedModel, selectedSessions]);

  useEffect(() => {
    if (sessionsFetcher.data && sessionsFetcher.data.sessions) {
      setRandomSampleSize(Math.floor(sessionsFetcher.data.sessions.count / 3))
    }
  }, [sessionsFetcher.data]);

  return (
    <ProjectRunCreator
      selectedAnnotationType={selectedAnnotationType}
      selectedPrompt={selectedPrompt}
      selectedPromptVersion={selectedPromptVersion}
      selectedModel={selectedModel}
      selectedSessions={selectedSessions}
      randomSampleSize={randomSampleSize}
      sessionsCount={sessionsFetcher?.data?.sessions?.count || 0}
      llmSettings={llmSettings}
      isRunButtonDisabled={isRunButtonDisabled}
      onSelectedAnnotationTypeChanged={onSelectedAnnotationTypeChanged}
      onSelectedPromptChanged={onSelectedPromptChanged}
      onSelectedPromptVersionChanged={onSelectedPromptVersionChanged}
      onSelectedModelChanged={onSelectedModelChanged}
      onSelectedSessionsChanged={onSelectedSessionsChanged}
      onStartRunButtonClicked={onStartRunButtonClicked}
      onRandomSampleSizeChanged={onRandomSampleSizeChanged}
      onSelectRandomSampleSizeButtonClicked={onSelectRandomSampleSizeButtonClicked}
      onLLMSettingsChanged={onLLMSettingsChanged}
    />
  )
}