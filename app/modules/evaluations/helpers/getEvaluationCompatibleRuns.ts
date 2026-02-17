import { sessionsMatch } from "~/modules/runSets/helpers/sessionsMatch";
import type { Run } from "~/modules/runs/runs.types";

function getNonSystemFieldKeys(schema: any[]): string[] {
  return schema.filter((field) => !field.isSystem).map((field) => field.fieldKey);
}

function hasSharedFields(
  keysA: string[],
  keysB: string[],
): boolean {
  const lookupSet = new Set(keysB);
  return keysA.some((key) => lookupSet.has(key));
}

export default function getEvaluationCompatibleRuns(
  runs: Run[],
  baseRunId: string | null,
): Run[] {
  if (!baseRunId) return [];
  const baseRunObj = runs.find((run) => run._id === baseRunId);
  if (!baseRunObj) return [];

  const baseSessionIds = baseRunObj.sessions.map((s) => s.sessionId);
  const baseFieldKeys = getNonSystemFieldKeys(
    baseRunObj.snapshot.prompt.annotationSchema,
  );

  return runs.filter((run) => {
    if (run._id === baseRunId) return false;
    const runSessionIds = run.sessions.map((s) => s.sessionId);
    if (!sessionsMatch(baseSessionIds, runSessionIds)) return false;
    const runFieldKeys = getNonSystemFieldKeys(
      run.snapshot.prompt.annotationSchema,
    );
    return hasSharedFields(baseFieldKeys, runFieldKeys);
  });
}
