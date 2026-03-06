import {
  CircleCheck,
  CircleX,
  Clock,
  LoaderCircle,
  OctagonX,
} from "lucide-react";
import type { ReactElement } from "react";
import type { Run, RunSession } from "~/modules/runs/runs.types";

export type StatusKey =
  | "RUNNING"
  | "FAILED"
  | "COMPLETE"
  | "QUEUED"
  | "STOPPED";

export const STATUS_META: Record<
  StatusKey,
  { icon: ReactElement; text: string }
> = {
  RUNNING: {
    icon: <LoaderCircle className="animate-spin" />,
    text: "Running",
  },
  FAILED: {
    icon: <CircleX className="text-destructive" />,
    text: "Failed",
  },
  COMPLETE: {
    icon: <CircleCheck className="text-sandpiper-success" />,
    text: "Complete",
  },
  QUEUED: {
    icon: <Clock className="text-muted-foreground" />,
    text: "Queued",
  },
  STOPPED: {
    icon: <OctagonX className="text-muted-foreground" />,
    text: "Stopped",
  },
};

export function getRunStatusKey(run: Run): StatusKey {
  if (run.isRunning) return "RUNNING";
  if (run.stoppedAt) return "STOPPED";
  if (run.hasErrored) return "FAILED";
  if (run.isComplete) return "COMPLETE";
  return "QUEUED";
}

const SESSION_STATUS_MAP: Record<RunSession["status"], StatusKey> = {
  RUNNING: "RUNNING",
  ERRORED: "FAILED",
  DONE: "COMPLETE",
  NOT_STARTED: "QUEUED",
  STOPPED: "STOPPED",
};

export function getRunSessionStatusKey(
  status: RunSession["status"],
): StatusKey {
  return SESSION_STATUS_MAP[status] ?? "QUEUED";
}
