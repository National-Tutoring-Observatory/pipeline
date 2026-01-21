import { parse } from "csv-parse/sync";

interface SessionData {
  [key: string]: string;
}

interface SessionDataMap {
  [sessionId: string]: SessionData[];
}

export default function parseCSV(fileContents: string): SessionDataMap {
  const lines = parse(fileContents, {
    columns: true,
    skip_empty_lines: true,
  }) as SessionData[];

  const sessionMap = new Map<string, SessionData[]>();

  for (const line of lines) {
    const sessionId = line.session_id;

    if (!sessionId) {
      throw new Error('CSV file is missing required "session_id" column');
    }

    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, []);
    }

    sessionMap.get(sessionId)!.push(line);
  }

  // Convert Map to plain object for JSON serialization
  return Object.fromEntries(sessionMap);
}
