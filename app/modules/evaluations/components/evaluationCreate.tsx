import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router";

export default function EvaluationCreate({
  runSetName,
  name,
  isSubmitting,
  isAbleToCreateEvaluation,
  projectId,
  runSetId,
  onNameChanged,
  onSubmit,
  onCancel,
}: {
  runSetName: string;
  name: string;
  isSubmitting: boolean;
  isAbleToCreateEvaluation: boolean;
  projectId: string;
  runSetId: string;
  onNameChanged: (value: string) => void;
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
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="runSet">Run Set</Label>
        <Input id="runSet" value={runSetName} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Evaluation Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChanged(e.target.value)}
          placeholder="Enter evaluation name"
        />
      </div>

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
