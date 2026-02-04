import { useState } from "react";
import type { PrefillData, PromptReference } from "../collections.types";
import { calculateEstimates } from "../helpers/calculateEstimates";
import CollectionCreatorAnnotationType from "../components/collectionCreatorAnnotationType";
import CollectionCreatorFooter from "../components/collectionCreatorFooter";
import CollectionCreatorFormAlerts from "../components/collectionCreatorFormAlerts";
import CollectionCreatorModels from "../components/collectionCreatorModels";
import CollectionCreatorName from "../components/collectionCreatorName";
import CollectionCreatorPrompts from "../components/collectionCreatorPrompts";
import CollectionCreatorSessions from "../components/collectionCreatorSessions";
import CollectionRunPreview from "../components/collectionRunPreview";

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

export default function CollectionCreatorContainer({
  prefillData,
  onSubmit,
  isLoading,
  errors,
}: {
  prefillData?: PrefillData | null;
  onSubmit: (requestBody: string) => void;
  isLoading: boolean;
  errors: Record<string, string>;
}) {
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

  const estimation = calculateEstimates(
    selectedPrompts,
    selectedModels,
    selectedSessions,
  );

  const handleAnnotationTypeChange = (type: string) => {
    setAnnotationType(type);
    setSelectedPrompts([]);
  };

  const handleSubmit = () => {
    const requestBody = JSON.stringify({
      intent: "CREATE_COLLECTION",
      payload: {
        name,
        annotationType,
        prompts: selectedPrompts,
        models: selectedModels,
        sessions: selectedSessions,
      },
    });
    onSubmit(requestBody);
  };

  return (
    <div className="">
      <div className="flex gap-8 p-8">
        <div className="w-[480px] shrink-0 space-y-8">
          <CollectionCreatorFormAlerts
            errors={errors}
            prefillData={prefillData}
          />

          <CollectionCreatorName name={name} onNameChanged={setName} />

          <CollectionCreatorAnnotationType
            annotationType={annotationType}
            onAnnotationTypeChanged={handleAnnotationTypeChange}
          />

          <CollectionCreatorPrompts
            annotationType={annotationType}
            selectedPrompts={selectedPrompts}
            onPromptsChanged={setSelectedPrompts}
          />

          <CollectionCreatorModels
            selectedModels={selectedModels}
            onModelsChanged={setSelectedModels}
          />

          <CollectionCreatorSessions
            selectedSessions={selectedSessions}
            onSessionsChanged={setSelectedSessions}
          />
        </div>

        <CollectionRunPreview
          name={name}
          selectedPrompts={selectedPrompts}
          selectedModels={selectedModels}
          selectedSessions={selectedSessions}
        />
      </div>

      <CollectionCreatorFooter
        name={name}
        selectedPrompts={selectedPrompts}
        selectedModels={selectedModels}
        selectedSessions={selectedSessions}
        estimation={estimation}
        isLoading={isLoading}
        onCreateClicked={handleSubmit}
      />
    </div>
  );
}
