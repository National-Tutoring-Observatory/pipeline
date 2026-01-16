import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import type { PrefillData, PromptReference } from '~/modules/collections/collections.types';
import CollectionCreatorAnnotationType from './collectionCreatorAnnotationType';
import CollectionCreatorDetails from './collectionCreatorDetails';
import CollectionCreatorErrors from './collectionCreatorErrors';
import CollectionCreatorFooter from './collectionCreatorFooter';
import CollectionCreatorModels from './collectionCreatorModels';
import CollectionCreatorPreview from './collectionCreatorPreview';
import CollectionCreatorPrompts from './collectionCreatorPrompts';
import CollectionCreatorSessions from './collectionCreatorSessions';

export default function CollectionCreator({
  name,
  annotationType,
  selectedPrompts,
  selectedModels,
  selectedSessions,
  tempPromptId,
  tempPromptVersion,
  tempModel,
  errors,
  prefillData,
  isSubmitDisabled,
  onNameChanged,
  onAnnotationTypeChanged,
  onAddPrompt,
  onRemovePrompt,
  onTempPromptChanged,
  onTempPromptVersionChanged,
  onTempModelChanged,
  onAddModel,
  onRemoveModel,
  onSessionsChanged,
  onCreateCollectionClicked,
}: {
  name: string;
  annotationType: string;
  selectedPrompts: PromptReference[];
  selectedModels: string[];
  selectedSessions: string[];
  tempPromptId: string | null;
  tempPromptVersion: number | null;
  tempModel: string;
  errors: Record<string, string>;
  prefillData?: PrefillData | null;
  isLoading: boolean;
  isSubmitDisabled: boolean;
  onNameChanged: (name: string) => void;
  onAnnotationTypeChanged: (annotationType: string) => void;
  onAddPrompt: () => void;
  onRemovePrompt: (promptId: string, promptVersion: number) => void;
  onTempPromptChanged: (promptId: string, promptName?: string) => void,
  onTempPromptVersionChanged: (promptVersion: number) => void,
  onTempModelChanged: (model: string) => void,
  onAddModel: () => void,
  onRemoveModel: (model: string) => void,
  onPromptsChanged: (prompts: PromptReference[]) => void;
  onModelsChanged: (models: string[]) => void;
  onSessionsChanged: (sessions: string[]) => void;
  onCreateCollectionClicked: () => void;
}) {

  return (
    <div>
      <div className="flex gap-12 p-8">

        <div className="w-[480px] shrink-0 space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Collection</h1>
            <p className="text-muted-foreground">Set up a new collection with your preferred run settings</p>
          </div>

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

          <CollectionCreatorErrors errors={errors} />

          <CollectionCreatorDetails
            name={name}
            onNameChanged={onNameChanged}
          />

          <Separator />

          <CollectionCreatorAnnotationType
            annotationType={annotationType}
            onAnnotationTypeChanged={onAnnotationTypeChanged}
          />

          <Separator />

          <CollectionCreatorPrompts
            selectedPrompts={selectedPrompts}
            annotationType={annotationType}
            tempPromptId={tempPromptId}
            tempPromptVersion={tempPromptVersion}
            onAddPrompt={onAddPrompt}
            onRemovePrompt={onRemovePrompt}
            onTempPromptChanged={onTempPromptChanged}
            onTempPromptVersionChanged={onTempPromptVersionChanged}
          />

          <Separator />

          <CollectionCreatorModels
            selectedModels={selectedModels}
            tempModel={tempModel}
            onTempModelChanged={onTempModelChanged}
            onAddModel={onAddModel}
            onRemoveModel={onRemoveModel}
          />

          <Separator />

          <CollectionCreatorSessions
            selectedSessions={selectedSessions}
            onSessionsChanged={onSessionsChanged}
          />

        </div>


        <CollectionCreatorPreview
          selectedPrompts={selectedPrompts}
          selectedModels={selectedModels}
          selectedSessions={selectedSessions}
        />

      </div>

      <CollectionCreatorFooter
        selectedPrompts={selectedPrompts}
        selectedModels={selectedModels}
        selectedSessions={selectedSessions}
        isSubmitDisabled={isSubmitDisabled}
        onCreateCollectionClicked={onCreateCollectionClicked}
      />
    </div>
  );
}
