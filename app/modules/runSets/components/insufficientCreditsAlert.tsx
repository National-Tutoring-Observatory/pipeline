import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useId } from "react";

export default function InsufficientCreditsAlert({
  exceedsBalance,
  acknowledged,
  onAcknowledgedChanged,
}: {
  exceedsBalance: boolean;
  acknowledged: boolean;
  onAcknowledgedChanged: (value: boolean) => void;
}) {
  const id = useId();

  if (!exceedsBalance) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>
          Estimated cost exceeds your remaining credits. Runs may fail if
          credits are exhausted.
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Checkbox
            id={id}
            checked={acknowledged}
            onCheckedChange={(checked) =>
              onAcknowledgedChanged(Boolean(checked))
            }
          />
          <Label htmlFor={id} className="text-sm font-normal whitespace-nowrap">
            I understand and want to proceed
          </Label>
        </div>
      </AlertDescription>
    </Alert>
  );
}
