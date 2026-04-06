import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

export default function EvaluationValidationAlert({
  name,
  baseRun,
  selectedRuns,
  selectedAnnotationFields,
}: {
  name: string;
  baseRun: string | null;
  selectedRuns: string[];
  selectedAnnotationFields: string[];
}) {
  const missingFields: string[] = [];

  if (!name.trim()) {
    missingFields.push("Evaluation name");
  }
  if (!baseRun) {
    missingFields.push("A base run");
  }
  if (selectedRuns.length === 0) {
    missingFields.push("At least one comparison run");
  }
  if (selectedAnnotationFields.length === 0) {
    missingFields.push("At least one annotation field");
  }

  if (missingFields.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertDescription>Required: {missingFields.join(", ")}</AlertDescription>
    </Alert>
  );
}
