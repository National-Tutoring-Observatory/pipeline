import type { StatusKey } from "~/modules/runs/helpers/statusMeta";

const STATUS_MATCH: Record<StatusKey, Record<string, unknown>> = {
  RUNNING: { isRunning: true },
  STOPPED: { stoppedAt: { $exists: true } },
  FAILED: { hasErrored: true },
  PARTIAL_FAILURE: { hasErrored: true },
  COMPLETE: { isComplete: true, hasErrored: false },
  QUEUED: {
    isRunning: false,
    stoppedAt: { $exists: false },
    hasErrored: false,
    isComplete: false,
  },
};

export default function buildRunStatusMatch(
  statusKey: string,
): Record<string, unknown> | null {
  if (statusKey in STATUS_MATCH) {
    return STATUS_MATCH[statusKey as StatusKey];
  }
  return null;
}
