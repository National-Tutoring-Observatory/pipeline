import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyTitle } from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { StatItem } from "@/components/ui/stat-item";
import { AlertTriangle, Info, Plus, X } from "lucide-react";
import { useState } from "react";
import ModelSelectorContainer from "~/modules/prompts/containers/modelSelectorContainer";
import PromptSelectorContainer from "~/modules/prompts/containers/promptSelectorContainer";
import type { Collection, PromptReference } from "../collections.types";
import { calculateEstimates } from "../helpers/calculateEstimates";
import {
  buildUsedPromptModelKey,
  buildUsedPromptModelSet,
  type PromptModelPair,
} from "../helpers/getUsedPromptModels";
import EstimateSummary from "./estimateSummary";

interface CollectionCreateRunsFormProps {
  collection: Collection;
  selectedPrompts: PromptReference[];
  selectedModels: string[];
  usedPromptModels: PromptModelPair[];
  onPromptsChanged: (prompts: PromptReference[]) => void;
  onModelsChanged: (models: string[]) => void;
  onCreateClicked: () => void;
  onCancelClicked: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
}

export default function CollectionCreateRunsForm({
  collection,
  selectedPrompts,
  selectedModels,
  usedPromptModels,
  onPromptsChanged,
  onModelsChanged,
  onCreateClicked,
  onCancelClicked,
  isLoading,
  errors,
}: CollectionCreateRunsFormProps) {
  const [tempPromptId, setTempPromptId] = useState<string | null>(null);
  const [tempPromptName, setTempPromptName] = useState<string | null>(null);
  const [tempPromptVersion, setTempPromptVersion] = useState<number | null>(
    null,
  );
  const [tempModel, setTempModel] = useState<string>("");

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

  const onAddPrompt = () => {
    if (!tempPromptId || !tempPromptName || tempPromptVersion == null) return;

    const newPrompt: PromptReference = {
      promptId: tempPromptId,
      promptName: tempPromptName,
      version: tempPromptVersion,
    };

    if (
      !selectedPrompts.some(
        (p) => p.promptId === tempPromptId && p.version === tempPromptVersion,
      )
    ) {
      onPromptsChanged([...selectedPrompts, newPrompt]);
    }

    setTempPromptId(null);
    setTempPromptName(null);
    setTempPromptVersion(null);
  };

  const onRemovePrompt = (promptId: string, version: number) => {
    onPromptsChanged(
      selectedPrompts.filter(
        (p) => !(p.promptId === promptId && p.version === version),
      ),
    );
  };

  const onAddModel = () => {
    if (!tempModel || selectedModels.includes(tempModel)) return;
    onModelsChanged([...selectedModels, tempModel]);
    setTempModel("");
  };

  const onRemoveModel = (model: string) => {
    onModelsChanged(selectedModels.filter((m) => m !== model));
  };

  const newRunsCount = getNewRunsCount();
  const duplicateCount = getDuplicateCount();

  const isSubmitDisabled =
    isLoading ||
    selectedPrompts.length === 0 ||
    selectedModels.length === 0 ||
    newRunsCount === 0;

  return (
    <div>
      <div className="flex gap-8 p-8">
        <div className="w-[480px] shrink-0 space-y-8">
          <div className="rounded-lg border bg-slate-50 p-4">
            <h3 className="mb-4 text-sm font-semibold">Collection Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatItem label="Name">{collection.name}</StatItem>
              <StatItem label="Annotation Type">
                {collection.annotationType === "PER_UTTERANCE"
                  ? "Per Utterance"
                  : "Per Session"}
              </StatItem>
              <StatItem label="Sessions">
                {collection.sessions?.length || 0}
              </StatItem>
              <StatItem label="Existing Runs">
                {collection.runs?.length || 0}
              </StatItem>
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-red-900">
                Errors
              </h3>
              <ul className="space-y-1 text-sm text-red-700">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>• {message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-bold">Prompts</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <PromptSelectorContainer
                  annotationType={collection.annotationType}
                  selectedPrompt={tempPromptId}
                  selectedPromptVersion={tempPromptVersion}
                  selectedPrompts={selectedPrompts}
                  onSelectedPromptChanged={(id, name) => {
                    setTempPromptId(id);
                    setTempPromptName(name || null);
                  }}
                  onSelectedPromptVersionChanged={setTempPromptVersion}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onAddPrompt}
                  disabled={
                    !tempPromptId ||
                    tempPromptVersion == null ||
                    selectedPrompts.some(
                      (p) =>
                        p.promptId === tempPromptId &&
                        p.version === tempPromptVersion,
                    )
                  }
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Prompt
                </Button>
              </div>

              {selectedPrompts.length > 0 && (
                <div className="space-y-2 border-t pt-2">
                  {selectedPrompts.map((prompt) => (
                    <div
                      key={`${prompt.promptId}-${prompt.version}`}
                      className="flex items-center justify-between rounded bg-white p-2"
                    >
                      <span className="text-sm">
                        {prompt.promptName} (v{prompt.version})
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onRemovePrompt(prompt.promptId, prompt.version)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold">Models</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <ModelSelectorContainer
                  selectedModel={tempModel}
                  excludeModels={selectedModels}
                  onSelectedModelChanged={setTempModel}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onAddModel}
                  disabled={!tempModel || selectedModels.includes(tempModel)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Model
                </Button>
              </div>

              {selectedModels.length > 0 && (
                <div className="space-y-2 border-t pt-2">
                  {selectedModels.map((model) => (
                    <div
                      key={model}
                      className="flex items-center justify-between rounded bg-white p-2"
                    >
                      <span className="text-sm">{model}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveModel(model)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="sticky top-4 min-w-0 flex-1 self-start overflow-y-auto rounded-lg border bg-slate-50"
          style={{ height: "calc(100vh - 144px)" }}
        >
          {selectedPrompts.length > 0 && selectedModels.length > 0 ? (
            <div className="space-y-4">
              <div className="sticky top-0 rounded-t-lg border-b bg-white px-4 py-4">
                <h3 className="mb-2 text-sm font-semibold">Run Preview</h3>
                <p className="text-muted-foreground text-xs">
                  {newRunsCount} new run(s) will be created
                  {duplicateCount > 0 && (
                    <span className="text-amber-600">
                      {" "}
                      • {duplicateCount} duplicate(s) will be skipped
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 pb-4 2xl:grid-cols-3">
                {selectedPrompts.map((prompt) =>
                  selectedModels.map((model) => {
                    const isDuplicate = isPromptModelUsed(
                      prompt.promptId,
                      prompt.version,
                      model,
                    );
                    return (
                      <div
                        key={`${prompt.promptId}-${prompt.version}-${model}`}
                        className={`rounded-lg border p-3 text-sm ${
                          isDuplicate
                            ? "border-amber-200 bg-amber-50 opacity-60"
                            : "bg-white"
                        }`}
                      >
                        {isDuplicate && (
                          <div className="mb-2 flex items-center gap-1 text-xs text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            Already exists
                          </div>
                        )}
                        <p className="text-muted-foreground mb-2 text-xs font-medium">
                          {isDuplicate ? "Skipped" : "New Run"}
                        </p>
                        <div className="space-y-1">
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Prompt
                            </p>
                            <p className="truncate font-mono text-xs">
                              {prompt.promptName} (v{prompt.version})
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Model
                            </p>
                            <p className="truncate font-mono text-xs">
                              {model}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          ) : (
            <div className="sticky top-8 p-8">
              <Empty className="border border-slate-300">
                <EmptyContent>
                  <EmptyTitle>
                    Select prompts and models to preview runs
                  </EmptyTitle>
                </EmptyContent>
              </Empty>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center gap-8 rounded-b-4xl border-t bg-white px-8 py-4">
        <div className="flex-1">
          {newRunsCount > 0 ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-blue-900">
                  This will create <strong>{newRunsCount}</strong> new run(s)
                  with {selectedPrompts.length} prompt(s) ×{" "}
                  {selectedModels.length} model(s) across{" "}
                  {collection.sessions?.length || 0} session(s)
                  {duplicateCount > 0 && (
                    <span className="text-amber-700">
                      {" "}
                      ({duplicateCount} duplicate combination(s) will be
                      skipped)
                    </span>
                  )}
                </p>
                <EstimateSummary estimation={estimation} />
              </div>
            </div>
          ) : selectedPrompts.length > 0 && selectedModels.length > 0 ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>All combinations already exist</AlertTitle>
              <AlertDescription>
                All selected prompt+model combinations are already in this
                collection. Please select different prompts or models.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Select prompts and models</AlertTitle>
              <AlertDescription>
                Choose at least one prompt and one model to create new runs.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancelClicked}>
            Cancel
          </Button>
          <Button onClick={onCreateClicked} disabled={isSubmitDisabled}>
            {isLoading && <Spinner className="mr-2" />}
            {isLoading ? "Creating..." : `Create ${newRunsCount} Run(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
