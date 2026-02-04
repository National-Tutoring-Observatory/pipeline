import { Button } from "@/components/ui/button";
import type {
  EstimationResult,
  PromptReference,
} from "~/modules/collections/collections.types";
import CollectionValidationAlert from "./collectionValidationAlert";
import EstimateSummary from "./estimateSummary";

export default function CollectionCreatorFooter({
  name,
  selectedPrompts,
  selectedModels,
  selectedSessions,
  estimation,
  isLoading,
  onCreateClicked,
}: {
  name: string;
  selectedPrompts: PromptReference[];
  selectedModels: string[];
  selectedSessions: string[];
  estimation: EstimationResult;
  isLoading: boolean;
  onCreateClicked: () => void;
}) {
  const isSubmitDisabled =
    isLoading ||
    !name.trim() ||
    selectedPrompts.length === 0 ||
    selectedModels.length === 0 ||
    selectedSessions.length === 0;

  return (
    <div className="sticky bottom-0 flex items-center gap-8 rounded-b-4xl border-t bg-white px-8 py-4">
      <div className="flex-1">
        {isSubmitDisabled ? (
          <CollectionValidationAlert
            name={name}
            selectedPrompts={selectedPrompts}
            selectedModels={selectedModels}
            selectedSessions={selectedSessions}
          />
        ) : (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-blue-900">
                This will create{" "}
                <strong>
                  {selectedPrompts.length * selectedModels.length}
                </strong>{" "}
                run(s) with {selectedPrompts.length} prompt(s) ×{" "}
                {selectedModels.length} model(s) across{" "}
                {selectedSessions.length} session(s)
              </p>
              <EstimateSummary estimation={estimation} />
            </div>
          </div>
        )}
      </div>
      <Button size="lg" onClick={onCreateClicked} disabled={isSubmitDisabled}>
        Create Collection & Launch Runs
      </Button>
    </div>
  );
}
