import type { RunSession } from "~/modules/runs/runs.types";
import { SessionService } from "~/modules/sessions/session";

export default async function buildRunSessions(
  sessionIds: string[],
): Promise<RunSession[]> {
  const sessions: RunSession[] = [];
  for (const sessionId of sessionIds) {
    const session = await SessionService.findById(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    sessions.push({
      name: session.name,
      fileType: session.fileType || "",
      sessionId,
      status: "RUNNING",
      startedAt: new Date(),
      finishedAt: new Date(),
    });
  }
  return sessions;
}
