import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

export default function RunSetValidationAlert({
  name,
  runsCount,
  selectedSessions,
}: {
  name: string;
  runsCount: number;
  selectedSessions: string[];
}) {
  const missingFields: string[] = [];

  if (!name.trim()) {
    missingFields.push("Run set name");
  }
  if (runsCount === 0) {
    missingFields.push("At least one prompt and model combination");
  }
  if (selectedSessions.length === 0) {
    missingFields.push("At least one session");
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
