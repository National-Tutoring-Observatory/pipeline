import type { Run } from "~/modules/runs/runs.types";
import type { SessionFile } from "../sessions.types";
import getVerificationChanges, {
  type VerificationChanges,
} from "./getVerificationChanges";

export default function getSessionVerificationChanges(
  run: Run,
  sessionFile: SessionFile,
): VerificationChanges | null {
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

  return getVerificationChanges(
    sessionFile.preVerificationAnnotations,
    postAnnotations,
    run.snapshot.prompt.annotationSchema,
  );
}
