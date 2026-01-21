interface SessionData {
  [key: string]: any;
}

interface SessionDataMap {
  [sessionId: string]: SessionData[];
}

export default function parseJSONL(fileContents: string): SessionDataMap {
  const lines = fileContents.split("\n");
  const sessionMap = new Map<string, SessionData[]>();

  for (const line of lines) {
    if (line.trim() === "") continue;

    let data: SessionData;

    try {
      data = JSON.parse(line);
    } catch (error) {
      throw new Error(
        `Failed to parse JSONL line: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    const sessionId = data.session_id;

    if (!sessionId) {
      throw new Error('JSONL record is missing required "session_id" field');
    }

    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, []);
    }

    sessionMap.get(sessionId)!.push(data);
  }

  // Convert Map to plain object for JSON serialization
  return Object.fromEntries(sessionMap);
}
