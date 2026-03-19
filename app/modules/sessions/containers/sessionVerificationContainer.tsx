import type { Run } from "~/modules/runs/runs.types";
import SessionVerification from "../components/sessionVerification";
import getVerificationChanges from "../helpers/getVerificationChanges";
import type { SessionFile } from "../sessions.types";

export default function SessionVerificationContainer({
  run,
  sessionFile,
}: {
  run: Run;
  sessionFile: SessionFile;
}) {
  if (
    !sessionFile.preVerificationAnnotations ||
    sessionFile.preVerificationAnnotations.length === 0
  ) {
    return null;
  }

  const postAnnotations =
    run.annotationType === "PER_UTTERANCE"
      ? sessionFile.transcript.flatMap((u) => u.annotations || [])
      : sessionFile.annotations;

  const verificationChanges = getVerificationChanges(
    sessionFile.preVerificationAnnotations,
    postAnnotations,
    run.snapshot.prompt.annotationSchema,
  );

  return <SessionVerification verificationChanges={verificationChanges} />;
}
