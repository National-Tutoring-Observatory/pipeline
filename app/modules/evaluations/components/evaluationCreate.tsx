import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router";
import type { AnnotationSchemaFieldCount } from "../helpers/getAnnotationSchemaFieldCounts";
import EvaluationCreateRunsSelector from "./evaluationCreateRunsSelector";

export default function EvaluationCreate({
  name,
  isSubmitting,
  isSubmitDisabled,
  isAbleToCreateEvaluation,
  projectId,
  runSetId,
  runs,
  baseRun,
  compatibleRuns,
  selectedRuns,
  annotationSchemaFieldCounts,
  selectedAnnotationFields,
  onNameChanged,
  onBaseRunChanged,
  onSelectedRunsChanged,
  onAnnotationFieldToggled,
  onSubmit,
  onCancel,
}: {
  name: string;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  isAbleToCreateEvaluation: boolean;
  projectId: string;
  runSetId: string;
  runs: Array<{ _id: string; name: string }>;
  baseRun: string | null;
  compatibleRuns: Array<{ _id: string; name: string }>;
  selectedRuns: string[];
  annotationSchemaFieldCounts: AnnotationSchemaFieldCount[];
  selectedAnnotationFields: string[];
  onNameChanged: (value: string) => void;
  onBaseRunChanged: (id: string | null) => void;
  onSelectedRunsChanged: (ids: string[]) => void;
  onAnnotationFieldToggled: (fieldKey: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (!isAbleToCreateEvaluation) {
    return (
      <div className="max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Unable to create evaluation</AlertTitle>
          <AlertDescription>
            At least 2 runs are required to create an evaluation.{" "}
            <Link
              to={`/projects/${projectId}/run-sets/${runSetId}`}
              className="underline"
            >
              Back to run set
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] flex-col">
      <div className="flex-1 space-y-6 pb-4">
        <div className="max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="name">Evaluation Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => onNameChanged(e.target.value)}
              placeholder="Enter evaluation name"
            />
          </div>
        </div>

        <EvaluationCreateRunsSelector
          runs={runs}
          baseRun={baseRun}
          compatibleRuns={compatibleRuns}
          selectedRuns={selectedRuns}
          annotationSchemaFieldCounts={annotationSchemaFieldCounts}
          selectedAnnotationFields={selectedAnnotationFields}
          onBaseRunChanged={onBaseRunChanged}
          onSelectedRunsChanged={onSelectedRunsChanged}
          onAnnotationFieldToggled={onAnnotationFieldToggled}
        />
      </div>

      <div className="bg-background sticky bottom-0 -mx-8 flex items-center gap-8 rounded-b-lg border-t px-8 py-4">
        <div className="flex-1">
          <div className="border-sandpiper-info/20 bg-sandpiper-info/5 rounded-lg border p-4">
            <p className="text-foreground text-sm">
              {baseRun && selectedRuns.length > 0 ? (
                <>
                  This evaluation will compare{" "}
                  <strong>{selectedRuns.length + 1}</strong> run(s) — 1 base run
                  + {selectedRuns.length} comparison run(s) over{" "}
                  <strong>{selectedAnnotationFields.length}</strong> annotation
                  field(s).
                </>
              ) : (
                "Select a base run and comparison runs to create an evaluation"
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="lg" onClick={onSubmit} disabled={isSubmitDisabled}>
            {isSubmitting ? "Creating..." : "Create Evaluation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
