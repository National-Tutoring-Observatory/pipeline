import type { Run } from "~/modules/runs/runs.types";

export interface AvailableAnnotationField {
  fieldKey: string;
  runCount: number;
}

export default function getAnnotationFieldsFromRuns(
  runs: Run[],
): AvailableAnnotationField[] {
  const fieldCounts = new Map<string, number>();

  for (const run of runs) {
    const schema = run.snapshot?.prompt?.annotationSchema;
    if (!schema) continue;

    for (const item of schema) {
      if (item.isSystem) continue;
      fieldCounts.set(item.fieldKey, (fieldCounts.get(item.fieldKey) ?? 0) + 1);
    }
  }

  return Array.from(fieldCounts.entries()).map(([fieldKey, runCount]) => ({
    fieldKey,
    runCount,
  }));
}
