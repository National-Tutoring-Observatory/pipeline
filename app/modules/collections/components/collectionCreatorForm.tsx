import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import annotationTypes from '~/modules/prompts/annotationTypes';
import PromptSelectorContainer from '~/modules/prompts/containers/promptSelectorContainer';
import ModelSelectorContainer from '~/modules/prompts/containers/modelSelectorContainer';
import SessionSelectorContainer from '~/modules/sessions/containers/sessionSelectorContainer';
import CollectionCreatorPreview from '~/modules/collections/components/collectionCreatorPreview';
import type { PrefillData, PromptReference } from '~/modules/collections/collections.types';
import { Info, Plus, X } from 'lucide-react';

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
  prefillData
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
  const [tempPromptVersion, setTempPromptVersion] = useState<number | null>(null);
  const [tempModel, setTempModel] = useState<string>('');

  const onAddPrompt = () => {
    if (!tempPromptId || tempPromptVersion == null) return;

    const newPrompt: PromptReference = {
      promptId: tempPromptId,
      promptName: tempPromptName || undefined,
      version: tempPromptVersion
    };

    if (!selectedPrompts.some(p => p.promptId === tempPromptId && p.version === tempPromptVersion)) {
      onPromptsChanged([...selectedPrompts, newPrompt]);
    }

    setTempPromptId(null);
    setTempPromptName(null);
    setTempPromptVersion(null);
  };

  const onRemovePrompt = (promptId: string, version: number) => {
    onPromptsChanged(selectedPrompts.filter(p => !(p.promptId === promptId && p.version === version)));
  };

  const onAddModel = () => {
    if (!tempModel || selectedModels.includes(tempModel)) return;
    onModelsChanged([...selectedModels, tempModel]);
    setTempModel('');
  };

  const onRemoveModel = (model: string) => {
    onModelsChanged(selectedModels.filter(m => m !== model));
  };

  const handleAnnotationTypeChange = (type: string) => {
    onAnnotationTypeChanged(type);
    onPromptsChanged([]);
    setTempPromptId(null);
    setTempPromptName(null);
    setTempPromptVersion(null);
  };

  const isSubmitDisabled = isLoading || !name.trim() || selectedPrompts.length === 0 || selectedModels.length === 0 || selectedSessions.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex gap-12">
        {/* Left Column - Form */}
        <div className="w-[480px] shrink-0 space-y-8">
        {prefillData && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Creating from template</AlertTitle>
            <AlertDescription>
              Fields pre-filled from run "{prefillData.sourceRunName}".
              You can modify any field before creating.
            </AlertDescription>
          </Alert>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2">Errors</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>• {String(message)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Collection Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Collection Name</Label>
          <Input
            id="name"
            placeholder="e.g., Question Asking Experiment"
            value={name}
            onChange={(e) => onNameChanged(e.target.value)}
          />
        </div>

        <Separator />

        {/* Annotation Type */}
        <div className="space-y-2">
          <Label htmlFor="annotationType">Annotation Type</Label>
          <Select value={annotationType} onValueChange={handleAnnotationTypeChange}>
            <SelectTrigger id="annotationType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {annotationTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Prompts */}
        <div className="space-y-3">
          <Label>Prompts</Label>
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
              disabled={!tempPromptId || tempPromptVersion == null || selectedPrompts.some(p => p.promptId === tempPromptId && p.version === tempPromptVersion)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Prompt
            </Button>
          </div>

          {selectedPrompts.length > 0 && (
            <div className="space-y-1 pt-2">
              {selectedPrompts.map((prompt) => (
                <div key={`${prompt.promptId}-${prompt.version}`} className="flex items-center justify-between py-2 px-3 border rounded-md bg-muted/50">
                  <span className="text-sm">
                    {prompt.promptName || prompt.promptId} (v{prompt.version})
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemovePrompt(prompt.promptId, prompt.version)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Models */}
        <div className="space-y-3">
          <Label>Models</Label>
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
              <Plus className="w-4 h-4" />
              Add Model
            </Button>
          </div>

          {selectedModels.length > 0 && (
            <div className="space-y-1 pt-2">
              {selectedModels.map((model) => (
                <div key={model} className="flex items-center justify-between py-2 px-3 border rounded-md bg-muted/50">
                  <span className="text-sm">{model}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveModel(model)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Sessions */}
        <div className="space-y-3">
          <Label>Sessions</Label>
          <SessionSelectorContainer
            selectedSessions={selectedSessions}
            onSelectedSessionsChanged={onSessionsChanged}
          />
        </div>
      </div>

      {/* Right Column - Run Preview */}
      <CollectionCreatorPreview
        selectedPrompts={selectedPrompts}
        selectedModels={selectedModels}
        selectedSessions={selectedSessions}
      />
      </div>

      {/* Footer - Summary and Button */}
      <div className="flex gap-8 items-center sticky bottom-0 border-t bg-background px-8 py-4 -mx-8">
        <div className="flex-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              This will create <strong>{selectedPrompts.length * selectedModels.length}</strong> run(s)
              with {selectedPrompts.length} prompt(s) × {selectedModels.length} model(s) across {selectedSessions.length} session(s)
            </p>
          </div>
        </div>
        <Button
          size="lg"
          onClick={onCreateClicked}
          disabled={isSubmitDisabled}
        >
          Create Collection & Launch Runs
        </Button>
      </div>
    </div>
  );
}
