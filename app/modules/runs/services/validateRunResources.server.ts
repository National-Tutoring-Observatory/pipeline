import findModelByCode from "~/modules/llm/helpers/findModelByCode";
import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import type { Run } from "~/modules/runs/runs.types";

export async function validateRunResources(run: Run): Promise<string[]> {
  const warnings: string[] = [];

  const modelCode = run.snapshot?.model?.code;
  if (modelCode && !findModelByCode(modelCode)) {
    warnings.push(`Model "${run.snapshot.model.name}" is no longer available`);
  }

  const promptId =
    typeof run.prompt === "string" ? run.prompt : run.prompt._id;
  const prompt = await PromptService.findById(promptId);
  if (!prompt) {
    warnings.push(
      `Prompt "${run.snapshot?.prompt?.name || promptId}" no longer exists`,
    );
  } else if (run.promptVersion) {
    const promptVersion = await PromptVersionService.findOne({
      prompt: promptId,
      version: run.promptVersion,
    });
    if (!promptVersion) {
      warnings.push(
        `Prompt "${prompt.name}" version ${run.promptVersion} no longer exists`,
      );
    }
  }

  return warnings;
}
