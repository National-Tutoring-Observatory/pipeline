import { useState } from "react";
import type { Collection, PromptReference } from "../collections.types";
import CollectionCreateRunsFooter from "../components/collectionCreateRunsFooter";
import CollectionCreateRunsInfo from "../components/collectionCreateRunsInfo";
import CollectionCreateRunsPreview from "../components/collectionCreateRunsPreview";
import CollectionCreatorFormAlerts from "../components/collectionCreatorFormAlerts";
import CollectionCreatorModels from "../components/collectionCreatorModels";
import CollectionCreatorPrompts from "../components/collectionCreatorPrompts";
import { calculateEstimates } from "../helpers/calculateEstimates";
import {
  buildUsedPromptModelKey,
  buildUsedPromptModelSet,
  type PromptModelPair,
} from "../helpers/getUsedPromptModels";

interface CollectionCreateRunsContainerProps {
  collection: Collection;
  usedPromptModels: PromptModelPair[];
  onSubmit: (requestBody: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
}

export default function CollectionCreateRunsContainer({
  collection,
  usedPromptModels,
  onSubmit,
  onCancel,
  isLoading,
  errors,
}: CollectionCreateRunsContainerProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<PromptReference[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const usedKeys = buildUsedPromptModelSet(usedPromptModels);

  const estimation = calculateEstimates(
    selectedPrompts,
    selectedModels,
    collection.sessions || [],
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
          <CollectionCreateRunsInfo collection={collection} />

          <CollectionCreatorFormAlerts errors={errors} />

          <CollectionCreatorPrompts
            annotationType={collection.annotationType}
            selectedPrompts={selectedPrompts}
            onPromptsChanged={setSelectedPrompts}
          />

          <CollectionCreatorModels
            selectedModels={selectedModels}
            onModelsChanged={setSelectedModels}
          />
        </div>

        <CollectionCreateRunsPreview
          selectedPrompts={selectedPrompts}
          selectedModels={selectedModels}
          newRunsCount={newRunsCount}
          duplicateCount={duplicateCount}
          isPromptModelUsed={isPromptModelUsed}
        />
      </div>

      <CollectionCreateRunsFooter
        collection={collection}
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
