export interface ParsedAnnotationColumn {
  annotator: string;
  field: string;
  index?: number;
  subField?: string;
}

const ANNOTATION_COLUMN_REGEX =
  /^annotator\[["']?([^\]"']+)["']?\](\w+)(?:\[(\d+)\](\w+)?)?$/;

export default function parseAnnotationColumn(
  columnName: string,
): ParsedAnnotationColumn | null {
  const match = columnName.match(ANNOTATION_COLUMN_REGEX);
  if (!match) return null;

  const [, annotator, field, indexStr, subField] = match;

  const result: ParsedAnnotationColumn = { annotator, field };

  if (indexStr !== undefined) {
    result.index = parseInt(indexStr, 10);
  }

  if (subField) {
    result.subField = subField;
  }

  return result;
}
