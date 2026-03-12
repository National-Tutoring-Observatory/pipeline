import type { Run } from "../runs.types";

export default function getAnnotatorName(run: Run, index = 0): string {
  return run.isHuman && run.annotator?.name
    ? run.annotator.name
    : `AI-${index}`;
}
