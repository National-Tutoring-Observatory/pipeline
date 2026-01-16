import { Button } from "@/components/ui/button";
import type { PromptReference } from "../collections.types";

const CollectionCreatorFooter = ({
  selectedPrompts,
  selectedModels,
  selectedSessions,
  isSubmitDisabled,
  onCreateCollectionClicked
}: {
  selectedPrompts: PromptReference[],
  selectedModels: string[],
  selectedSessions: string[],
  isSubmitDisabled: boolean,
  onCreateCollectionClicked: () => void
}) => {
  return (
    <div className="flex gap-8 items-center sticky bottom-0 border-t bg-white px-8 py-4 rounded-b-lg">
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
        onClick={onCreateCollectionClicked}
        disabled={isSubmitDisabled}
      >
        Create Collection & Launch Runs
      </Button>
    </div>
  );
};

export default CollectionCreatorFooter;
