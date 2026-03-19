import type { Run } from "~/modules/runs/runs.types";
import SessionVerification from "../components/sessionVerification";
import getSessionVerificationChanges from "../helpers/getSessionVerificationChanges";
import type { SessionFile } from "../sessions.types";

export default function SessionVerificationContainer({
  run,
  sessionFile,
  showVerificationDetails,
  onToggleVerificationDetails,
}: {
  run: Run;
  sessionFile: SessionFile;
  showVerificationDetails: boolean;
  onToggleVerificationDetails: () => void;
}) {
  const verificationChanges = getSessionVerificationChanges(run, sessionFile);

  if (!verificationChanges) {
    return null;
  }

  return (
    <SessionVerification
      verificationChanges={verificationChanges}
      showVerificationDetails={showVerificationDetails}
      onToggleVerificationDetails={onToggleVerificationDetails}
    />
  );
}
