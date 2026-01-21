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

export function getRunModelCode(run: Run): string {
  if (run.snapshot?.model) {
    return run.snapshot?.model?.code;
  } else {
    return run.model;
  }
}

export function getRunModelDisplayName(run: Run): string {
  const modelInfo = getRunModelInfo(run);
  if (!modelInfo) {
    return run.model;
  } else {
    return modelInfo.name;
  }
}

export default getRunModelInfo;
