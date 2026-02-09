import type { RunSet } from "~/modules/runSets/runSets.types";

export default function isAbleToCreateEvaluation(runSet: RunSet): boolean {
  return (runSet.runs?.length ?? 0) > 1;
}
