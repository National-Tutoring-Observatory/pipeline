import type { Run } from "~/modules/runs/runs.types";

export default function getRunDisabledReason(run: Run): string | null {
  if (run.hasErrored) return "Run has errored";
  if (!run.isComplete) return "Run is not complete";
  return null;
}
