import type { Run } from "~/modules/runs/runs.types";
import type { Collection } from "../collections.types";
import { sessionsMatch } from "./sessionsMatch";

interface CompatibilityResult {
  compatible: boolean;
  reason?: string;
}

export function isRunCompatibleWithCollection(
  run: Run,
  collection: Collection,
): CompatibilityResult {
  if (run.project !== collection.project) {
    return { compatible: false, reason: "different project" };
  }

  if (run.annotationType !== collection.annotationType) {
    return { compatible: false, reason: "incompatible annotation type" };
  }

  const runSessionIds = run.sessions.map((s) => s.sessionId);
  const collectionSessionIds = collection.sessions;

  if (!sessionsMatch(runSessionIds, collectionSessionIds)) {
    return { compatible: false, reason: "sessions do not match" };
  }

  return { compatible: true };
}
