import { useState } from "react";
import RunSetCreatorAnnotationType from "../components/runSetCreatorAnnotationType";
import RunSetCreatorFooter from "../components/runSetCreatorFooter";
import RunSetCreatorFormAlerts from "../components/runSetCreatorFormAlerts";
import RunSetCreatorModels from "../components/runSetCreatorModels";
import RunSetCreatorName from "../components/runSetCreatorName";
import RunSetCreatorPrompts from "../components/runSetCreatorPrompts";
import RunSetCreatorSessions from "../components/runSetCreatorSessions";
import RunSetRunPreview from "../components/runSetRunPreview";
import { calculateEstimates } from "../helpers/calculateEstimates";
import type { PrefillData, PromptReference } from "../runSets.types";

function getDefaultName(prefillData?: PrefillData | null): string {
  if (!prefillData) return "";
  if (prefillData.sourceRunSetName) {
    return `Run set from ${prefillData.sourceRunSetName}`;
  }
  if (prefillData.sourceRunName) {
    return `Run set from ${prefillData.sourceRunName}`;
  }
  return "";
}

export default function RunSetCreatorContainer({
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
      intent: "CREATE_RUN_SET",
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
          <RunSetCreatorFormAlerts errors={errors} prefillData={prefillData} />

          <RunSetCreatorName name={name} onNameChanged={setName} />

          <RunSetCreatorAnnotationType
            annotationType={annotationType}
            onAnnotationTypeChanged={handleAnnotationTypeChange}
          />

          <RunSetCreatorPrompts
            annotationType={annotationType}
            selectedPrompts={selectedPrompts}
            onPromptsChanged={setSelectedPrompts}
          />

          <RunSetCreatorModels
            selectedModels={selectedModels}
            onModelsChanged={setSelectedModels}
          />

          <RunSetCreatorSessions
            selectedSessions={selectedSessions}
            onSessionsChanged={setSelectedSessions}
          />
        </div>

        <RunSetRunPreview
          name={name}
          selectedPrompts={selectedPrompts}
          selectedModels={selectedModels}
          sessionsCount={selectedSessions.length}
        />
      </div>

      <RunSetCreatorFooter
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
