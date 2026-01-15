import { useEffect, useState } from 'react';
import { useNavigate, useFetcher } from 'react-router';
import { toast } from 'sonner';
import CollectionCreatorForm from '../components/collectionCreatorForm';
import type { PrefillData, PromptReference } from '../collections.types';

interface CollectionCreatorFormContainerProps {
  projectId: string;
  prefillData?: PrefillData | null;
}

export default function CollectionCreatorFormContainer({ projectId, prefillData }: CollectionCreatorFormContainerProps) {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [name, setName] = useState(prefillData ? `Collection from ${prefillData.sourceRunName}` : '');
  const [annotationType, setAnnotationType] = useState(prefillData?.annotationType || 'PER_UTTERANCE');
  const [selectedPrompts, setSelectedPrompts] = useState<PromptReference[]>(prefillData?.selectedPrompts || []);
  const [selectedModels, setSelectedModels] = useState<string[]>(prefillData?.selectedModels || []);
  const [selectedSessions, setSelectedSessions] = useState<string[]>(prefillData?.selectedSessions || []);

  useEffect(() => {
    if (fetcher.data && 'intent' in fetcher.data && fetcher.data.intent === 'CREATE_COLLECTION' && 'data' in fetcher.data) {
      const success = fetcher.data.data.errors?.length === 0;
      if (success) {
        toast.success('Collection created successfully');
        navigate(`/projects/${projectId}/collections/${fetcher.data.data.collectionId}`);
      }
    }
  }, [fetcher.data, navigate, projectId]);

  const handleCreateCollection = () => {
    fetcher.submit(
      JSON.stringify({
        intent: 'CREATE_COLLECTION',
        payload: {
          name,
          annotationType,
          prompts: selectedPrompts,
          models: selectedModels,
          sessions: selectedSessions
        }
      }),
      { method: 'POST', encType: 'application/json' }
    );
  };

  return (
    <CollectionCreatorForm
      name={name}
      annotationType={annotationType}
      selectedPrompts={selectedPrompts}
      selectedModels={selectedModels}
      selectedSessions={selectedSessions}
      onNameChanged={setName}
      onAnnotationTypeChanged={setAnnotationType}
      onPromptsChanged={setSelectedPrompts}
      onModelsChanged={setSelectedModels}
      onSessionsChanged={setSelectedSessions}
      onCreateClicked={handleCreateCollection}
      isLoading={false}
      errors={(fetcher.data as any)?.errors || {}}
      prefillData={prefillData}
    />
  );
}
