import { sessionsMatch } from "~/modules/collections/helpers/sessionsMatch";
import type { Run } from "~/modules/runs/runs.types";

export default function getEvaluationCompatibleRuns(
  runs: Run[],
  baseRunId: string | null,
): Run[] {
  if (!baseRunId) return [];
  const baseRunObj = runs.find((run) => run._id === baseRunId);
  if (!baseRunObj) return [];
  const baseSessionIds = baseRunObj.sessions.map((s) => s.sessionId);
  const baseSchema = JSON.stringify(
    baseRunObj.snapshot.prompt.annotationSchema,
  );
  return runs.filter((run) => {
    if (run._id === baseRunId) return false;
    const runSessionIds = run.sessions.map((s) => s.sessionId);
    if (!sessionsMatch(baseSessionIds, runSessionIds)) return false;
    return JSON.stringify(run.snapshot.prompt.annotationSchema) === baseSchema;
  });
}
