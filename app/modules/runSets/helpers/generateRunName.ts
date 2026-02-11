import type { PromptReference } from "../runSets.types";

export function generateRunName(
  runSetName: string,
  prompt: PromptReference,
  model: string,
): string {
  const promptLabel = prompt.promptName
    ? `${prompt.promptName} v${prompt.version}`
    : prompt.promptId;

  const finalRunSetName = runSetName.trim() || "Untitled Run Set";

  return `${finalRunSetName} - ${promptLabel} - ${model}`;
}
