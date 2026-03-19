import type { VerificationChanges } from "../helpers/getVerificationChanges";

export default function SessionVerification({
  verificationChanges,
}: {
  verificationChanges: VerificationChanges;
}) {
  return (
    <div className="text-muted-foreground py-2">
      <span className="text-muted-foreground">Verification</span>
      <div className="text-xs">
        {verificationChanges.changed.length} changed,{" "}
        {verificationChanges.added.length} added,{" "}
        {verificationChanges.removed.length} removed
      </div>
    </div>
  );
}
