import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router";
import EvaluationCreateRunsSelector from "./evaluationCreateRunsSelector";

export default function EvaluationCreate({
  name,
  isSubmitting,
  isAbleToCreateEvaluation,
  projectId,
  collectionId,
  runs,
  baseRun,
  compatibleRuns,
  selectedRuns,
  onNameChanged,
  onBaseRunChanged,
  onSelectedRunsChanged,
  onSubmit,
  onCancel,
}: {
  name: string;
  isSubmitting: boolean;
  isAbleToCreateEvaluation: boolean;
  projectId: string;
  collectionId: string;
  runs: Array<{ _id: string; name: string }>;
  baseRun: string | null;
  compatibleRuns: Array<{ _id: string; name: string }>;
  selectedRuns: string[];
  onNameChanged: (value: string) => void;
  onBaseRunChanged: (id: string | null) => void;
  onSelectedRunsChanged: (ids: string[]) => void;
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
              to={`/projects/${projectId}/collections/${collectionId}`}
              className="underline"
            >
              Back to collection
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        onBaseRunChanged={onBaseRunChanged}
        onSelectedRunsChanged={onSelectedRunsChanged}
      />

      <div className="flex gap-4">
        <Button onClick={onSubmit} disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? "Creating..." : "Create Evaluation"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
