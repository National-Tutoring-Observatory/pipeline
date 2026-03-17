import type { Run } from "../runs.types";

const VOTING_FIELDS = ["markedAs", "votingReason"];

export default function getAnnotationExportFields(run: Run): string[] {
  const schema = run.snapshot?.prompt?.annotationSchema ?? [];
  return schema
    .filter((field: any) => !field.isSystem || field.fieldKey === "reasoning")
    .map((field: any) => field.fieldKey)
    .concat(VOTING_FIELDS);
}
