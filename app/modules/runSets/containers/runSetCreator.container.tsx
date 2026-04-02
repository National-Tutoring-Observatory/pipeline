import { useMemo, useState } from "react";
import Flag from "~/modules/featureFlags/components/flag";
import type { SessionData } from "~/modules/sessions/sessions.types";
import RunSetCreatorAnnotationType from "../components/runSetCreatorAnnotationType";
import RunSetCreatorFooter from "../components/runSetCreatorFooter";
import RunSetCreatorFormAlerts from "../components/runSetCreatorFormAlerts";
import RunSetCreatorModels from "../components/runSetCreatorModels";
import RunSetCreatorName from "../components/runSetCreatorName";
import RunSetCreatorPrompts from "../components/runSetCreatorPrompts";
import RunSetCreatorSessions from "../components/runSetCreatorSessions";
import RunSetCreatorVerificationToggle from "../components/runSetCreatorVerificationToggle";
import RunSetRunPreview from "../components/runSetRunPreview";
import buildDefinitionsFromSelection from "../helpers/buildDefinitionsFromSelection";
import { calculateEstimates } from "../helpers/calculateEstimates";
import useCreditAcknowledgment from "../hooks/useCreditAcknowledgment";
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
  avgSecondsPerSession,
  outputToInputRatio,
  balance,
  onSubmit,
  isLoading,
  errors,
}: {
  prefillData?: PrefillData | null;
  avgSecondsPerSession: number | null;
  outputToInputRatio: number | null;
  balance: number;
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
  const [selectedSessions, setSelectedSessions] = useState<SessionData[]>(
    prefillData?.selectedSessions || [],
  );
  const [shouldRunVerification, setShouldRunVerification] = useState(false);
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set());

  const allDefinitions = useMemo(
    () => buildDefinitionsFromSelection(selectedPrompts, selectedModels),
    [selectedPrompts, selectedModels],
  );

  const runDefinitions = allDefinitions.filter((d) => !removedKeys.has(d.key));
  const excludedDefinitions = allDefinitions.filter((d) =>
    removedKeys.has(d.key),
  );

  const estimation = calculateEstimates(runDefinitions, selectedSessions, {
    shouldRunVerification,
    avgSecondsPerSession,
    outputToInputRatio,
  });

  const creditAcknowledgment = useCreditAcknowledgment(
    estimation.estimatedCost,
    balance,
  );

  const handleAnnotationTypeChange = (type: string) => {
    setAnnotationType(type);
    setSelectedPrompts([]);
    setRemovedKeys(new Set());
  };

  const handlePromptsChanged = (prompts: PromptReference[]) => {
    setSelectedPrompts(prompts);
    setRemovedKeys(new Set());
  };

  const handleModelsChanged = (models: string[]) => {
    setSelectedModels(models);
    setRemovedKeys(new Set());
  };

  const handleRemoveCard = (key: string) => {
    setRemovedKeys((prev) => new Set(prev).add(key));
  };

  const handleRestoreCard = (key: string) => {
    setRemovedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleSubmit = () => {
    const requestBody = JSON.stringify({
      intent: "CREATE_RUN_SET",
      payload: {
        name,
        annotationType,
        definitions: runDefinitions,
        sessions: selectedSessions.map((s) => s._id),
        shouldRunVerification,
        acknowledgedInsufficientCredits: creditAcknowledgment.acknowledged,
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
            onPromptsChanged={handlePromptsChanged}
          />

          <RunSetCreatorModels
            selectedModels={selectedModels}
            onModelsChanged={handleModelsChanged}
          />

          <Flag flag="HAS_RUN_VERIFICATION">
            <RunSetCreatorVerificationToggle
              shouldRunVerification={shouldRunVerification}
              onShouldRunVerificationChanged={setShouldRunVerification}
            />
          </Flag>

          <RunSetCreatorSessions
            selectedSessions={selectedSessions.map((s) => s._id)}
            onSessionsChanged={setSelectedSessions}
          />
        </div>

        <RunSetRunPreview
          name={name}
          runDefinitions={runDefinitions}
          excludedDefinitions={excludedDefinitions}
          sessionsCount={selectedSessions.length}
          onRemoveCard={handleRemoveCard}
          onRestoreCard={handleRestoreCard}
        />
      </div>

      <RunSetCreatorFooter
        name={name}
        runsCount={runDefinitions.length}
        selectedSessions={selectedSessions.map((s) => s._id)}
        estimation={estimation}
        balance={balance}
        creditAcknowledgment={creditAcknowledgment}
        isLoading={isLoading}
        onCreateClicked={handleSubmit}
      />
    </div>
  );
}
