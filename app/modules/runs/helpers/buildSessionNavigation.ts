import type { RunSession } from "../runs.types";

interface SessionNavigationPosition {
  currentIndex: number;
  totalDone: number;
  prevSessionId: string | null;
  nextSessionId: string | null;
}

export default function buildSessionNavigation(
  sessions: RunSession[],
  currentSessionId: string,
): SessionNavigationPosition {
  let prevSessionId: string | null = null;
  let nextSessionId: string | null = null;
  let currentIndex = -1;
  let doneCount = 0;
  let found = false;

  for (const session of sessions) {
    if (session.status !== "DONE") continue;
    doneCount++;

    if (session.sessionId === currentSessionId) {
      currentIndex = doneCount - 1;
      found = true;
      continue;
    }

    if (found && !nextSessionId) {
      nextSessionId = session.sessionId;
    }

    if (!found) {
      prevSessionId = session.sessionId;
    }
  }

  return { currentIndex, totalDone: doneCount, prevSessionId, nextSessionId };
}
