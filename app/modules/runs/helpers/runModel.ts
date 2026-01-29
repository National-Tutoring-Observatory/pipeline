import type { ModelInfo } from "~/modules/llm/model.types";
import type { Run } from "~/modules/runs/runs.types";

export function getRunModelInfo(run: Run): ModelInfo | undefined {
  if (run.snapshot?.model) {
    return {
      code: run.snapshot.model.code,
      name: run.snapshot.model.name,
      provider: run.snapshot.model.provider,
    };
  }
  return undefined;
}

export function getRunModelCode(run: Run): string | undefined {
  return run.snapshot?.model?.code;
}

export function getRunModelDisplayName(run: Run): string | undefined {
  return run.snapshot?.model?.name;
}

export default getRunModelInfo;
