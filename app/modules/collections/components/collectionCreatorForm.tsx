import type { PrefillData, PromptReference } from "../collections.types";
import { calculateEstimates } from "../helpers/calculateEstimates";
import CollectionCreatorAnnotationType from "./collectionCreatorAnnotationType";
import CollectionCreatorFooter from "./collectionCreatorFooter";
import CollectionCreatorFormAlerts from "./collectionCreatorFormAlerts";
import CollectionCreatorModels from "./collectionCreatorModels";
import CollectionCreatorName from "./collectionCreatorName";
import CollectionCreatorPrompts from "./collectionCreatorPrompts";
import CollectionCreatorSessions from "./collectionCreatorSessions";
import CollectionRunPreview from "./collectionRunPreview";

export default function CollectionCreatorForm({
  name,
  annotationType,
  selectedPrompts,
  selectedModels,
  selectedSessions,
  onNameChanged,
  onAnnotationTypeChanged,
  onPromptsChanged,
  onModelsChanged,
  onSessionsChanged,
  onCreateClicked,
  isLoading,
  errors,
  prefillData,
}: {
  name: string;
  annotationType: string;
  selectedPrompts: PromptReference[];
  selectedModels: string[];
  selectedSessions: string[];
  onNameChanged: (name: string) => void;
  onAnnotationTypeChanged: (type: string) => void;
  onPromptsChanged: (prompts: PromptReference[]) => void;
  onModelsChanged: (models: string[]) => void;
  onSessionsChanged: (sessions: string[]) => void;
  onCreateClicked: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
  prefillData?: PrefillData | null;
}) {
  const estimation = calculateEstimates(
    selectedPrompts,
    selectedModels,
    selectedSessions,
  );

  const handleAnnotationTypeChange = (type: string) => {
    onAnnotationTypeChanged(type);
    onPromptsChanged([]);
  };

  return (
    <div className="">
      <div className="flex gap-8 p-8">
        <div className="w-[480px] shrink-0 space-y-8">
          <CollectionCreatorFormAlerts
            errors={errors}
            prefillData={prefillData}
          />

          <CollectionCreatorName name={name} onNameChanged={onNameChanged} />

          <CollectionCreatorAnnotationType
            annotationType={annotationType}
            onAnnotationTypeChanged={handleAnnotationTypeChange}
          />

          <CollectionCreatorPrompts
            annotationType={annotationType}
            selectedPrompts={selectedPrompts}
            onPromptsChanged={onPromptsChanged}
          />

          <CollectionCreatorModels
            selectedModels={selectedModels}
            onModelsChanged={onModelsChanged}
          />

          <CollectionCreatorSessions
            selectedSessions={selectedSessions}
            onSessionsChanged={onSessionsChanged}
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
        onCreateClicked={onCreateClicked}
      />
    </div>
  );
}
