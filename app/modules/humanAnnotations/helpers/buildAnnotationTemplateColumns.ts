import type { AnnotationTemplateConfig } from "../humanAnnotations.types";

const CONTEXT_COLUMNS = ["session_id", "sequence_id", "role", "content"];

export default function buildAnnotationTemplateColumns(
  config: AnnotationTemplateConfig,
): string[] {
  const columns = [...CONTEXT_COLUMNS];

  for (const annotator of config.annotators) {
    for (const field of config.fields) {
      for (let i = 0; i < field.slots; i++) {
        columns.push(`annotator[${annotator}][${i}]${field.fieldKey}`);
      }
    }
  }

  return columns;
}
