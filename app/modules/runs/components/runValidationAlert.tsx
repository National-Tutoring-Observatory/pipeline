import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

export default function RunValidationAlert({
  runName,
  selectedPrompt,
  selectedPromptVersion,
  selectedSessions,
}: {
  runName: string;
  selectedPrompt: string | null;
  selectedPromptVersion: number | null;
  selectedSessions: string[];
}) {
  const missingFields: string[] = [];

  if (runName.trim().length < 3) {
    missingFields.push("Run name");
  }
  if (!selectedPrompt) {
    missingFields.push("A prompt");
  }
  if (!selectedPromptVersion) {
    missingFields.push("A prompt version");
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
