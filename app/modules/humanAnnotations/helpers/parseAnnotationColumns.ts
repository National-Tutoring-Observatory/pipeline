export interface ParsedAnnotationColumn {
  annotator: string;
  index: number;
  field: string;
}

const ANNOTATION_COLUMN_REGEX =
  /^annotator\[["']?([^\]"']+)["']?\]\[(\d+)\](\w+)$/;

export default function parseAnnotationColumn(
  columnName: string,
): ParsedAnnotationColumn | null {
  const match = columnName.match(ANNOTATION_COLUMN_REGEX);
  if (!match) return null;

  const [, annotator, indexStr, field] = match;

  return {
    annotator,
    index: parseInt(indexStr, 10),
    field,
  };
}
