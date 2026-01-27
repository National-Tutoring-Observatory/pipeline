import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Plus, X } from "lucide-react";
import { useState } from "react";
import type {
  PrefillData,
  PromptReference,
} from "~/modules/collections/collections.types";
import annotationTypes from "~/modules/prompts/annotationTypes";
import ModelSelectorContainer from "~/modules/prompts/containers/modelSelectorContainer";
import PromptSelectorContainer from "~/modules/prompts/containers/promptSelectorContainer";
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";

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
  const [tempPromptId, setTempPromptId] = useState<string | null>(null);
  const [tempPromptName, setTempPromptName] = useState<string | null>(null);
  const [tempPromptVersion, setTempPromptVersion] = useState<number | null>(
    null,
  );
  const [tempModel, setTempModel] = useState<string>("");

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

  const handleAnnotationTypeChange = (type: string) => {
    onAnnotationTypeChanged(type);
    onPromptsChanged([]);
    setTempPromptId(null);
    setTempPromptName(null);
    setTempPromptVersion(null);
  };

  const isSubmitDisabled =
    isLoading ||
    !name.trim() ||
    selectedPrompts.length === 0 ||
    selectedModels.length === 0 ||
    selectedSessions.length === 0;

  return (
    <div className="">
      {/* Top Section - Form and Cards */}
      <div className="flex gap-8 p-8">
        {/* Left Column - Form */}
        <div className="w-[480px] shrink-0 space-y-8">
          {prefillData && (
            <Alert
              variant={
                prefillData.validationErrors?.length ? "destructive" : "default"
              }
            >
              <Info className="h-4 w-4" />
              <AlertTitle>Creating from template</AlertTitle>
              <AlertDescription>
                <p>
                  Fields pre-filled from{" "}
                  {prefillData.sourceCollectionName ? "collection" : "run"} "
                  {prefillData.sourceCollectionName ||
                    prefillData.sourceRunName}
                  ". You can modify any field before creating.
                </p>
                {prefillData.validationErrors?.length ? (
                  <ul className="mt-2 list-inside list-disc">
                    {prefillData.validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                ) : null}
              </AlertDescription>
            </Alert>
          )}

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

          {/* Collection Name */}
          <div className="space-y-2">
            <Label className="font-bold" htmlFor="name">
              Collection Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Question Asking Experiment"
              value={name}
              onChange={(e) => onNameChanged(e.target.value)}
            />
          </div>

          {/* Annotation Type */}
          <div className="space-y-2">
            <Label className="font-bold" htmlFor="annotationType">
              Annotation Type
            </Label>
            <Select
              value={annotationType}
              onValueChange={handleAnnotationTypeChange}
            >
              <SelectTrigger id="annotationType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {annotationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompts */}
          <div className="space-y-2">
            <Label className="font-bold">Prompts</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <PromptSelectorContainer
                  annotationType={annotationType}
                  selectedPrompt={tempPromptId}
                  selectedPromptVersion={tempPromptVersion}
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

          {/* Models */}
          <div className="space-y-2">
            <Label className="font-bold">Models</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <ModelSelectorContainer
                  selectedModel={tempModel}
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

          {/* Sessions */}
          <div className="space-y-2">
            <Label className="font-bold">Sessions</Label>
            <div>
              <SessionSelectorContainer
                selectedSessions={selectedSessions}
                onSelectedSessionsChanged={onSessionsChanged}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Run Preview */}
        <div
          className="sticky top-4 min-w-0 flex-1 self-start overflow-y-auto rounded-lg border bg-slate-50"
          style={{ height: "calc(100vh - 144px)" }}
        >
          {selectedPrompts.length > 0 && selectedModels.length > 0 ? (
            <div className="space-y-4">
              <div className="sticky top-0 rounded-t-lg border-b bg-white px-4 py-4">
                <h3 className="mb-2 text-sm font-semibold">Generated Runs</h3>
                <p className="text-muted-foreground text-xs">
                  {selectedPrompts.length * selectedModels.length} run(s) •{" "}
                  {selectedSessions.length} session(s)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 pb-4 2xl:grid-cols-3">
                {selectedPrompts.map((prompt) =>
                  selectedModels.map((model) => (
                    <div
                      key={`${prompt.promptId}-${model}`}
                      className="rounded-lg border bg-white p-3 text-sm"
                    >
                      <p className="text-muted-foreground mb-2 text-xs font-medium">
                        Run
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
                          <p className="text-muted-foreground text-xs">Model</p>
                          <p className="truncate font-mono text-xs">{model}</p>
                        </div>
                      </div>
                    </div>
                  )),
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

      {/* Bottom Section - Summary and Button */}
      <div className="sticky bottom-0 flex items-center gap-8 rounded-b-4xl border-t bg-white px-8 py-4">
        <div className="flex-1">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              This will create{" "}
              <strong>{selectedPrompts.length * selectedModels.length}</strong>{" "}
              run(s) with {selectedPrompts.length} prompt(s) ×{" "}
              {selectedModels.length} model(s) across {selectedSessions.length}{" "}
              session(s)
            </p>
          </div>
        </div>
        <Button size="lg" onClick={onCreateClicked} disabled={isSubmitDisabled}>
          Create Collection & Launch Runs
        </Button>
      </div>
    </div>
  );
}
