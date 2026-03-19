import { Switch } from "@/components/ui/switch";
import type { VerificationChanges } from "../helpers/getVerificationChanges";

export default function SessionVerification({
  verificationChanges,
  showVerificationDetails,
  onToggleVerificationDetails,
}: {
  verificationChanges: VerificationChanges;
  showVerificationDetails: boolean;
  onToggleVerificationDetails: () => void;
}) {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Verification</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            Show verifications
          </span>
          <Switch
            checked={showVerificationDetails}
            onCheckedChange={onToggleVerificationDetails}
          />
        </div>
      </div>
      <div className="text-muted-foreground mt-1 text-xs">
        {verificationChanges.changed.length} changed,{" "}
        {verificationChanges.added.length} added,{" "}
        {verificationChanges.removed.length} removed
      </div>
    </div>
  );
}
