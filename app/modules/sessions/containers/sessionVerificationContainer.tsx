import type { Run } from "~/modules/runs/runs.types";
import SessionVerification from "../components/sessionVerification";
import getSessionVerificationChanges from "../helpers/getSessionVerificationChanges";
import type { SessionFile } from "../sessions.types";

export default function SessionVerificationContainer({
  run,
  sessionFile,
}: {
  run: Run;
  sessionFile: SessionFile;
}) {
  const verificationChanges = getSessionVerificationChanges(run, sessionFile);

  if (!verificationChanges) {
    return null;
  }

  return <SessionVerification verificationChanges={verificationChanges} />;
}
