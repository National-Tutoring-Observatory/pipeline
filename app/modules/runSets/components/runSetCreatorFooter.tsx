import { Button } from "@/components/ui/button";
import type { EstimationResult } from "~/modules/runSets/runSets.types";
import EstimateSummary from "./estimateSummary";
import RunSetValidationAlert from "./runSetValidationAlert";

export default function RunSetCreatorFooter({
  name,
  runsCount,
  selectedSessions,
  estimation,
  isLoading,
  onCreateClicked,
}: {
  name: string;
  runsCount: number;
  selectedSessions: string[];
  estimation: EstimationResult;
  isLoading: boolean;
  onCreateClicked: () => void;
}) {
  const isSubmitDisabled =
    isLoading ||
    !name.trim() ||
    runsCount === 0 ||
    selectedSessions.length === 0;

  return (
    <div className="sticky bottom-0 flex items-center gap-8 rounded-b-4xl border-t bg-white px-8 py-4">
      <div className="flex-1">
        {isSubmitDisabled ? (
          <RunSetValidationAlert
            name={name}
            runsCount={runsCount}
            selectedSessions={selectedSessions}
          />
        ) : (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-blue-900">
                This will create <strong>{runsCount}</strong> run(s) across{" "}
                {selectedSessions.length} session(s)
              </p>
              <EstimateSummary estimation={estimation} />
            </div>
          </div>
        )}
      </div>
      <Button size="lg" onClick={onCreateClicked} disabled={isSubmitDisabled}>
        Create Run Set & Launch Runs
      </Button>
    </div>
  );
}
