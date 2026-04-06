import { Button } from "@/components/ui/button";
import EvaluationSummary from "./evaluationSummary";
import EvaluationValidationAlert from "./evaluationValidationAlert";

export default function EvaluationCreateFooter({
  name,
  baseRun,
  selectedRuns,
  selectedAnnotationFields,
  isSubmitting,
  isSubmitDisabled,
  onSubmit,
  onCancel,
}: {
  name: string;
  baseRun: string | null;
  selectedRuns: string[];
  selectedAnnotationFields: string[];
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-background sticky bottom-0 -mx-8 flex items-center gap-8 rounded-b-lg border-t px-8 py-4">
      <div className="flex-1">
        {isSubmitDisabled && !isSubmitting ? (
          <EvaluationValidationAlert
            name={name}
            baseRun={baseRun}
            selectedRuns={selectedRuns}
            selectedAnnotationFields={selectedAnnotationFields}
          />
        ) : (
          <EvaluationSummary
            selectedRunsCount={selectedRuns.length}
            selectedAnnotationFieldsCount={selectedAnnotationFields.length}
          />
        )}
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitDisabled}>
          {isSubmitting ? "Creating..." : "Create Evaluation"}
        </Button>
      </div>
    </div>
  );
}
