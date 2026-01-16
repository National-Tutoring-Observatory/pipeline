import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import PromptSelectorContainer from "~/modules/prompts/containers/promptSelectorContainer";
import type { PromptReference } from "../collections.types";
import CollectionCreatorSelectedItem from "./collectionCreatorSelectedItem";

const CollectionCreatorPrompts = ({
  selectedPrompts,
  annotationType,
  tempPromptId,
  tempPromptVersion,
  onAddPrompt,
  onRemovePrompt,
  onTempPromptChanged,
  onTempPromptVersionChanged
}: {
  selectedPrompts: PromptReference[],
  annotationType: string,
  tempPromptId: string | null,
  tempPromptVersion: number | null,
  onAddPrompt: () => void,
  onRemovePrompt: (promptId: string, promptVersion: number) => void,
  onTempPromptChanged: (promptId: string, promptName?: string) => void,
  onTempPromptVersionChanged: (promptVersion: number) => void
}) => {
  return (
    <div className="space-y-2">
      <Label>Prompts</Label>
      <div className="space-y-3">
        <div className="space-y-2">
          <PromptSelectorContainer
            annotationType={annotationType}
            selectedPrompt={tempPromptId}
            selectedPromptVersion={tempPromptVersion}
            onSelectedPromptChanged={onTempPromptChanged}
            onSelectedPromptVersionChanged={onTempPromptVersionChanged}
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
          <div className="space-y-2 pt-2">
            {selectedPrompts.map((prompt) => (
              <CollectionCreatorSelectedItem
                key={`${prompt.promptId}-${prompt.version}`}
                text={`${prompt.promptName || prompt.promptId} (v${prompt.version})`}
                onRemoveClicked={() => onRemovePrompt(prompt.promptId, prompt.version)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionCreatorPrompts;
