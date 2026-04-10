import type { SessionFile } from "../../sessions/sessions.types";

export function convertMtmToSessionFile(
  raw: Record<string, unknown>,
): SessionFile {
  const sessionId = raw.id as string;
  const transcriptStr = raw.transcript as string;
  const lines = transcriptStr.split("\n").filter((l) => l.trim());

  const transcript = lines.map((line, index) => {
    const colonIdx = line.indexOf(":");
    const role = colonIdx !== -1 ? line.slice(0, colonIdx).trim() : "unknown";
    const content = colonIdx !== -1 ? line.slice(colonIdx + 1).trim() : line;
    return {
      _id: String(index),
      role,
      content,
      start_time: "",
      end_time: "",
      timestamp: "",
      session_id: sessionId,
      sequence_id: String(index),
      annotations: [],
    };
  });

  const roles = [...new Set(transcript.map((u) => u.role))];
  const nonStudentRoles = roles.filter((r) => r.toLowerCase() !== "student");
  const leadRole = nonStudentRoles[0] ?? roles[0] ?? "unknown";

  return { transcript, leadRole, annotations: [] };
}
