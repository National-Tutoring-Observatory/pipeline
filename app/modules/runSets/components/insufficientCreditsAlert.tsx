import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function InsufficientCreditsAlert({
  exceedsBalance,
}: {
  exceedsBalance: boolean;
}) {
  if (!exceedsBalance) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Estimated cost exceeds your remaining credits. Please top up your
        credits before starting this run.
      </AlertDescription>
    </Alert>
  );
}
