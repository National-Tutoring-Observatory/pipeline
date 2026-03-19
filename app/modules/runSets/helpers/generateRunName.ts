import findModelByCode from "~/modules/llm/helpers/findModelByCode";
import type { PromptReference } from "../runSets.types";

export function generateRunName(
  runSetName: string,
  prompt: PromptReference,
  modelCode: string,
): string {
  const promptLabel = prompt.promptName
    ? `${prompt.promptName} v${prompt.version}`
    : prompt.promptId;

  const finalRunSetName = runSetName.trim() || "Untitled Run Set";
  const modelName = findModelByCode(modelCode)?.name ?? modelCode;

  return `${finalRunSetName} - ${promptLabel} - ${modelName}`;
}
