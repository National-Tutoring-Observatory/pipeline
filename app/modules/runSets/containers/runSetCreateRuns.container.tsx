import { useState } from "react";
import RunSetCreateRunsFooter from "../components/runSetCreateRunsFooter";
import RunSetCreateRunsInfo from "../components/runSetCreateRunsInfo";
import RunSetCreateRunsPreview from "../components/runSetCreateRunsPreview";
import RunSetCreatorFormAlerts from "../components/runSetCreatorFormAlerts";
import RunSetCreatorModels from "../components/runSetCreatorModels";
import RunSetCreatorPrompts from "../components/runSetCreatorPrompts";
import { calculateEstimates } from "../helpers/calculateEstimates";
import {
  buildUsedPromptModelKey,
  buildUsedPromptModelSet,
  type PromptModelPair,
} from "../helpers/getUsedPromptModels";
import type { PromptReference, RunSet } from "../runSets.types";

interface RunSetCreateRunsContainerProps {
  runSet: RunSet;
  usedPromptModels: PromptModelPair[];
  onSubmit: (requestBody: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
}

export default function RunSetCreateRunsContainer({
  runSet,
  usedPromptModels,
  onSubmit,
  onCancel,
  isLoading,
  errors,
}: RunSetCreateRunsContainerProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<PromptReference[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const usedKeys = buildUsedPromptModelSet(usedPromptModels);

  const estimation = calculateEstimates(
    selectedPrompts,
    selectedModels,
    runSet.sessions || [],
  );

  const isPromptModelUsed = (
    promptId: string,
    promptVersion: number,
    modelCode: string,
  ): boolean => {
    const key = buildUsedPromptModelKey(promptId, promptVersion, modelCode);
    return usedKeys.has(key);
  };

  const getNewRunsCount = (): number => {
    let count = 0;
    for (const prompt of selectedPrompts) {
      for (const model of selectedModels) {
        if (!isPromptModelUsed(prompt.promptId, prompt.version, model)) {
          count++;
        }
      }
    }
    return count;
  };

  const getDuplicateCount = (): number => {
    let count = 0;
    for (const prompt of selectedPrompts) {
      for (const model of selectedModels) {
        if (isPromptModelUsed(prompt.promptId, prompt.version, model)) {
          count++;
        }
      }
    }
    return count;
  };

  const newRunsCount = getNewRunsCount();
  const duplicateCount = getDuplicateCount();

  const isSubmitDisabled =
    isLoading ||
    selectedPrompts.length === 0 ||
    selectedModels.length === 0 ||
    newRunsCount === 0;

  const handleCreateRuns = () => {
    const requestBody = JSON.stringify({
      intent: "CREATE_RUNS",
      payload: {
        prompts: selectedPrompts,
        models: selectedModels,
      },
    });
    onSubmit(requestBody);
  };

  return (
    <div>
      <div className="flex gap-8 p-8">
        <div className="w-[480px] shrink-0 space-y-8">
          <RunSetCreateRunsInfo runSet={runSet} />

          <RunSetCreatorFormAlerts errors={errors} />

          <RunSetCreatorPrompts
            annotationType={runSet.annotationType}
            selectedPrompts={selectedPrompts}
            onPromptsChanged={setSelectedPrompts}
          />

          <RunSetCreatorModels
            selectedModels={selectedModels}
            onModelsChanged={setSelectedModels}
          />
        </div>

        <RunSetCreateRunsPreview
          selectedPrompts={selectedPrompts}
          selectedModels={selectedModels}
          newRunsCount={newRunsCount}
          duplicateCount={duplicateCount}
          isPromptModelUsed={isPromptModelUsed}
        />
      </div>

      <RunSetCreateRunsFooter
        runSet={runSet}
        selectedPromptsCount={selectedPrompts.length}
        selectedModelsCount={selectedModels.length}
        newRunsCount={newRunsCount}
        duplicateCount={duplicateCount}
        estimation={estimation}
        isLoading={isLoading}
        isSubmitDisabled={isSubmitDisabled}
        onCancel={onCancel}
        onCreateClicked={handleCreateRuns}
      />
    </div>
  );
}
