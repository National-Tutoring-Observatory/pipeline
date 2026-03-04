import parseAnnotationColumn from "./parseAnnotationColumns";

export interface AnnotationCsvMeta {
  headers: string[];
  annotators: string[];
  annotationFields: string[];
  sessionIds: string[];
}

// Parses CSV text into rows, correctly handling multi-line quoted fields
function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "\r") continue;

    if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      row.push(current.trim());
      current = "";
      rows.push(row);
      row = [];
      continue;
    }

    current += char;
  }

  // Handle last field/row
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

export default function extractAnnotationCsvMeta(
  csvText: string,
): AnnotationCsvMeta {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) {
    return { headers: [], annotators: [], annotationFields: [], sessionIds: [] };
  }

  const headers = rows[0];

  const annotatorSet = new Set<string>();
  const fieldSet = new Set<string>();

  for (const header of headers) {
    const parsed = parseAnnotationColumn(header);
    if (!parsed) continue;
    annotatorSet.add(parsed.annotator);
    fieldSet.add(parsed.field);
  }

  const sessionIdIndex = headers.indexOf("session_id");
  const sessionIdSet = new Set<string>();

  if (sessionIdIndex !== -1) {
    for (let i = 1; i < rows.length; i++) {
      const sessionId = rows[i][sessionIdIndex];
      if (sessionId) {
        sessionIdSet.add(sessionId);
      }
    }
  }

  return {
    headers,
    annotators: Array.from(annotatorSet),
    annotationFields: Array.from(fieldSet),
    sessionIds: Array.from(sessionIdSet),
  };
}
