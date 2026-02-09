import type { Run } from "~/modules/runs/runs.types";
import type { RunSet } from "../runSets.types";
import { sessionsMatch } from "./sessionsMatch";

interface CompatibilityResult {
  compatible: boolean;
  reason?: string;
}

export function isRunCompatibleWithRunSet(
  run: Run,
  runSet: RunSet,
): CompatibilityResult {
  if (run.project !== runSet.project) {
    return { compatible: false, reason: "different project" };
  }

  if (run.annotationType !== runSet.annotationType) {
    return { compatible: false, reason: "incompatible annotation type" };
  }

  const runSessionIds = run.sessions.map((s) => s.sessionId);
  const runSetSessionIds = runSet.sessions;

  if (!sessionsMatch(runSessionIds, runSetSessionIds)) {
    return { compatible: false, reason: "sessions do not match" };
  }

  return { compatible: true };
}
