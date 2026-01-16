import { useState } from 'react';
import { useFetcher } from 'react-router';
import type { PrefillData, PromptReference } from '../collections.types';
import CollectionCreator from '../components/collectionCreator';

interface CollectionCreatorContainerProps {
  prefillData?: PrefillData | null;
  onCreateCollection: ({
    name,
    annotationType,
    selectedPrompts,
    selectedModels,
    selectedSessions
  }: {
    name: string;
    annotationType: string;
    selectedPrompts: PromptReference[];
    selectedModels: string[];
    selectedSessions: string[];
  }) => void
}

export default function CollectionCreatorContainer({
  prefillData,
  onCreateCollection
}: CollectionCreatorContainerProps) {
  const fetcher = useFetcher();

  const [name, setName] = useState(prefillData ? `Collection from ${prefillData.sourceRunName}` : '');
  const [annotationType, setAnnotationType] = useState(prefillData?.annotationType || 'PER_UTTERANCE');
  const [selectedPrompts, setSelectedPrompts] = useState<PromptReference[]>(prefillData?.selectedPrompts || []);
  const [selectedModels, setSelectedModels] = useState<string[]>(prefillData?.selectedModels || []);
  const [selectedSessions, setSelectedSessions] = useState<string[]>(prefillData?.selectedSessions || []);
  const [tempPromptId, setTempPromptId] = useState<string | null>(null);
  const [tempPromptName, setTempPromptName] = useState<string | null>(null);
  const [tempPromptVersion, setTempPromptVersion] = useState<number | null>(null);
  const [tempModel, setTempModel] = useState<string>('');

  const onTempModelChanged = (model: string) => {
    setTempModel(model)
  }

  const onAddPrompt = () => {
    if (!tempPromptId || tempPromptVersion == null) return;

    const newPrompt: PromptReference = {
      promptId: tempPromptId,
      promptName: tempPromptName || undefined,
      version: tempPromptVersion
    };

    if (!selectedPrompts.some(p => p.promptId === tempPromptId && p.version === tempPromptVersion)) {
      setSelectedPrompts([...selectedPrompts, newPrompt]);
    }

    setTempPromptId(null);
    setTempPromptName(null);
    setTempPromptVersion(null);
  };

  const onRemovePrompt = (promptId: string, version: number) => {
    setSelectedPrompts(selectedPrompts.filter(p => !(p.promptId === promptId && p.version === version)));
  };

  const onAddModel = () => {
    if (!tempModel || selectedModels.includes(tempModel)) return;
    setSelectedModels([...selectedModels, tempModel]);
    setTempModel('');
  };

  const onRemoveModel = (model: string) => {
    setSelectedModels(selectedModels.filter(m => m !== model));
  };

  const onTempPromptChanged = (promptId: string, promptName?: string) => {
    setTempPromptId(promptId);
    if (promptName) {
      setTempPromptName(promptName);
    }
  }

  const onTempPromptVersionChanged = (promptVersion: number) => {
    setTempPromptVersion(promptVersion);
  }

  const onAnnotationTypeChanged = (annotationType: string) => {
    setAnnotationType(annotationType);
    setSelectedPrompts([]);
    setTempPromptId(null);
    setTempPromptName(null);
    setTempPromptVersion(null);
  };

  const onCreateCollectionClicked = () => {
    onCreateCollection({
      name,
      annotationType,
      selectedPrompts,
      selectedModels,
      selectedSessions
    });
  }

  return (
    <CollectionCreator
      name={name}
      annotationType={annotationType}
      selectedPrompts={selectedPrompts}
      selectedModels={selectedModels}
      selectedSessions={selectedSessions}
      tempPromptId={tempPromptId}
      tempPromptVersion={tempPromptVersion}
      tempModel={tempModel}
      onNameChanged={setName}
      onAnnotationTypeChanged={onAnnotationTypeChanged}
      onPromptsChanged={setSelectedPrompts}
      onModelsChanged={setSelectedModels}
      onSessionsChanged={setSelectedSessions}
      onCreateCollectionClicked={onCreateCollectionClicked}
      onAddPrompt={onAddPrompt}
      onRemovePrompt={onRemovePrompt}
      onTempPromptChanged={onTempPromptChanged}
      onTempPromptVersionChanged={onTempPromptVersionChanged}
      onTempModelChanged={onTempModelChanged}
      onAddModel={onAddModel}
      onRemoveModel={onRemoveModel}
      isLoading={false}
      isSubmitDisabled={!name.trim() || selectedPrompts.length === 0 || selectedModels.length === 0 || selectedSessions.length === 0}
      errors={(fetcher.data as any)?.errors || {}}
      prefillData={prefillData}
    />
  );
}
