import type { PromptReference, RunDefinition } from "../runSets.types";
import { buildUsedPromptModelKey } from "./getUsedPromptModels";

export default function buildDefinitionsFromSelection(
  prompts: PromptReference[],
  models: string[],
): RunDefinition[] {
  const definitions: RunDefinition[] = [];
  for (const prompt of prompts) {
    for (const model of models) {
      definitions.push({
        key: buildUsedPromptModelKey(prompt.promptId, prompt.version, model),
        prompt,
        modelCode: model,
      });
    }
  }
  return definitions;
}
