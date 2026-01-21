import { useEffect, useState } from "react";
import { useNavigate, useFetcher } from "react-router";
import { toast } from "sonner";
import CollectionCreatorForm from "../components/collectionCreatorForm";
import type { PrefillData, PromptReference } from "../collections.types";

interface CollectionCreatorFormContainerProps {
  projectId: string;
  prefillData?: PrefillData | null;
}

function getDefaultName(prefillData?: PrefillData | null): string {
  if (!prefillData) return "";
  if (prefillData.sourceCollectionName) {
    return `Collection from ${prefillData.sourceCollectionName}`;
  }
  if (prefillData.sourceRunName) {
    return `Collection from ${prefillData.sourceRunName}`;
  }
  return "";
}

export default function CollectionCreatorFormContainer({
  projectId,
  prefillData,
}: CollectionCreatorFormContainerProps) {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [name, setName] = useState(getDefaultName(prefillData));
  const [annotationType, setAnnotationType] = useState(
    prefillData?.annotationType || "PER_UTTERANCE",
  );
  const [selectedPrompts, setSelectedPrompts] = useState<PromptReference[]>(
    prefillData?.selectedPrompts || [],
  );
  const [selectedModels, setSelectedModels] = useState<string[]>(
    prefillData?.selectedModels || [],
  );
  const [selectedSessions, setSelectedSessions] = useState<string[]>(
    prefillData?.selectedSessions || [],
  );

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (fetcher.data?.intent !== "CREATE_COLLECTION") return;

    const collectionId = fetcher.data.data?.collectionId;
    if (collectionId) {
      const runErrors = fetcher.data?.data?.errors;
      if (runErrors && runErrors.length > 0) {
        toast.warning(
          `Collection created, but ${runErrors.length} run(s) failed to start`,
        );
      } else {
        toast.success("Collection created successfully");
      }
      navigate(`/projects/${projectId}/collections/${collectionId}`);
    }
  }, [fetcher.state, fetcher.data, navigate, projectId]);

  const handleCreateCollection = () => {
    fetcher.submit(
      JSON.stringify({
        intent: "CREATE_COLLECTION",
        payload: {
          name,
          annotationType,
          prompts: selectedPrompts,
          models: selectedModels,
          sessions: selectedSessions,
        },
      }),
      { method: "POST", encType: "application/json" },
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
      isLoading={fetcher.state !== "idle"}
      errors={(fetcher.data as any)?.errors || {}}
      prefillData={prefillData}
    />
  );
}
