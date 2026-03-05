import type { AnnotationSchemaItem } from "~/modules/prompts/prompts.types";
import parseAnnotationColumn from "./parseAnnotationColumns";

export default function buildAnnotationSchemaFromHeaders(
  headers: string[],
): AnnotationSchemaItem[] {
  const fieldSet = new Set<string>();

  for (const header of headers) {
    const parsed = parseAnnotationColumn(header);
    if (!parsed) continue;
    fieldSet.add(parsed.field);
  }

  return Array.from(fieldSet).map((fieldKey) => ({
    fieldKey,
    value: "",
    isSystem: false,
  }));
}
