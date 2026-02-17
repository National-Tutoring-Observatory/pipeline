import type { Run } from "~/modules/runs/runs.types";

export interface AnnotationSchemaFieldCount {
  fieldKey: string;
  fieldType: string;
  matchCount: number;
  total: number;
}

export default function getAnnotationSchemaFieldCounts(
  runs: Run[],
  baseRunId: string | null,
  compatibleRuns: Run[],
): AnnotationSchemaFieldCount[] {
  if (!baseRunId) return [];
  const baseRunObj = runs.find((run) => run._id === baseRunId);
  if (!baseRunObj) return [];

  const nonSystemFields = baseRunObj.snapshot.prompt.annotationSchema.filter(
    (field) => !field.isSystem,
  );

  return nonSystemFields.map((field) => {
    const matchCount = compatibleRuns.filter((run) =>
      run.snapshot.prompt.annotationSchema.some(
        (runField) => !runField.isSystem && runField.fieldKey === field.fieldKey,
      ),
    ).length;

    return {
      fieldKey: field.fieldKey,
      fieldType: field.fieldType,
      matchCount,
      total: compatibleRuns.length,
    };
  });
}
