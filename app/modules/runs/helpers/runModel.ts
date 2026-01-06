import type { ModelInfo } from '~/modules/llm/model.types';
import type { Run } from '~/modules/runs/runs.types';

export function getRunModelInfo(run: Run): ModelInfo {
  return {
    code: run.snapshot.model.code,
    name: run.snapshot.model.name,
    provider: run.snapshot.model.provider
  };
}

export function getRunModelCode(run: Run): string {
  return run.snapshot.model.code;
}

export function getRunModelDisplayName(run: Run): string {
  return getRunModelInfo(run).name;
}

export default getRunModelInfo;
