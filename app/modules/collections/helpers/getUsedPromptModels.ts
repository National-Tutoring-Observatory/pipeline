import { getRunModelCode } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";

export interface PromptModelPair {
  promptId: string;
  promptVersion: number;
  modelCode: string;
}

export default function getUsedPromptModels(runs: Run[]): PromptModelPair[] {
  const pairs: PromptModelPair[] = [];

  for (const run of runs) {
    const modelCode = getRunModelCode(run);
    if (run.prompt && run.promptVersion && modelCode) {
      pairs.push({
        promptId: typeof run.prompt === "string" ? run.prompt : run.prompt._id,
        promptVersion: run.promptVersion,
        modelCode,
      });
    }
  }

  return pairs;
}

export function buildUsedPromptModelKey(
  promptId: string,
  promptVersion: number,
  modelCode: string,
): string {
  return `${promptId}-${promptVersion}-${modelCode}`;
}

export function buildUsedPromptModelSet(pairs: PromptModelPair[]): Set<string> {
  return new Set(
    pairs.map((p) =>
      buildUsedPromptModelKey(p.promptId, p.promptVersion, p.modelCode),
    ),
  );
}
