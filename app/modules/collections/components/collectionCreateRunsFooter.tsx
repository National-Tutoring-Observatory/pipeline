import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, Info } from "lucide-react";
import type { Collection, EstimationResult } from "../collections.types";
import EstimateSummary from "./estimateSummary";

type FooterState = "ready" | "all_duplicates" | "empty";

interface CollectionCreateRunsFooterProps {
  collection: Collection;
  selectedPromptsCount: number;
  selectedModelsCount: number;
  newRunsCount: number;
  duplicateCount: number;
  estimation: EstimationResult;
  isLoading: boolean;
  isSubmitDisabled: boolean;
  onCancel: () => void;
  onCreateClicked: () => void;
}

export default function CollectionCreateRunsFooter({
  collection,
  selectedPromptsCount,
  selectedModelsCount,
  newRunsCount,
  duplicateCount,
  estimation,
  isLoading,
  isSubmitDisabled,
  onCancel,
  onCreateClicked,
}: CollectionCreateRunsFooterProps) {
  const getFooterState = (): FooterState => {
    if (isLoading) return "ready";
    if (newRunsCount > 0) return "ready";
    if (selectedPromptsCount > 0 && selectedModelsCount > 0) {
      return "all_duplicates";
    }
    return "empty";
  };

  const footerState = getFooterState();

  return (
    <div className="sticky bottom-0 flex items-center gap-8 rounded-b-4xl border-t bg-white px-8 py-4">
      <div className="flex-1">
        {footerState === "ready" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-blue-900">
                This will create <strong>{newRunsCount}</strong> new run(s) with{" "}
                {selectedPromptsCount} prompt(s) × {selectedModelsCount}{" "}
                model(s) across {collection.sessions?.length || 0} session(s)
                {duplicateCount > 0 && (
                  <span className="text-amber-700">
                    {" "}
                    ({duplicateCount} duplicate combination(s) will be skipped)
                  </span>
                )}
              </p>
              <EstimateSummary estimation={estimation} />
            </div>
          </div>
        )}

        {footerState === "all_duplicates" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>All combinations already exist</AlertTitle>
            <AlertDescription>
              All selected prompt+model combinations are already in this
              collection. Please select different prompts or models.
            </AlertDescription>
          </Alert>
        )}

        {footerState === "empty" && (
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
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onCreateClicked} disabled={isSubmitDisabled}>
          {isLoading && <Spinner className="mr-2" />}
          {isLoading ? "Creating..." : `Create ${newRunsCount} Run(s)`}
        </Button>
      </div>
    </div>
  );
}
