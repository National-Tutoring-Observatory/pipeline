import parseAnnotationColumn from "./parseAnnotationColumns";

interface AnnotationObject {
  _id: string;
  identifiedBy: "HUMAN";
  [key: string]: any;
}

export default function buildAnnotationsForUtterance(
  row: Record<string, string>,
  utteranceId: string,
  annotator: string,
  headers: string[],
): AnnotationObject[] {
  // Group columns by field + index
  const groups = new Map<
    string,
    { field: string; values: Map<string, string> }
  >();

  for (const header of headers) {
    const parsed = parseAnnotationColumn(header);
    if (!parsed || parsed.annotator !== annotator) continue;

    const value = row[header];
    if (value === undefined || value === "") continue;

    const groupKey =
      parsed.index !== undefined
        ? `${parsed.field}[${parsed.index}]`
        : parsed.field;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { field: parsed.field, values: new Map() });
    }

    const subKey = parsed.subField || "value";
    groups.get(groupKey)!.values.set(subKey, value);
  }

  const annotations: AnnotationObject[] = [];

  for (const { field, values } of groups.values()) {
    const annotation: AnnotationObject = {
      _id: utteranceId,
      identifiedBy: "HUMAN",
    };

    const mainValue = values.get("value") || values.values().next().value;
    annotation[field] = mainValue;

    const reasoning = values.get("reasoning");
    if (reasoning) {
      annotation.reasoning = reasoning;
    }

    annotations.push(annotation);
  }

  return annotations;
}
