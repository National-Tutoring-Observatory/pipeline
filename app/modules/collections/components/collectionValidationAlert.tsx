import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import type { PromptReference } from "../collections.types";

export default function CollectionValidationAlert({
  name,
  selectedPrompts,
  selectedModels,
  selectedSessions,
}: {
  name: string;
  selectedPrompts: PromptReference[];
  selectedModels: string[];
  selectedSessions: string[];
}) {
  const missingFields: string[] = [];

  if (!name.trim()) {
    missingFields.push("Collection name");
  }
  if (selectedPrompts.length === 0) {
    missingFields.push("At least one prompt");
  }
  if (selectedModels.length === 0) {
    missingFields.push("At least one model");
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
