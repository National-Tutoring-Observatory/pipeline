import type { Run } from "../runs.types";

export default function getExportFieldKeys(run: Run): string[] {
  const schema = run.snapshot?.prompt?.annotationSchema;
  if (!schema) return [];
  return schema
    .filter((field: any) => !field.isSystem || field.fieldKey === "reasoning")
    .map((field: any) => field.fieldKey);
}
