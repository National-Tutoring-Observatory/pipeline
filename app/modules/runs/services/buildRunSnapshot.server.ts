import { PromptService } from "~/modules/prompts/prompt";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";

/**
 * Snapshot sections that can be added to a run
 * Stores complete frozen state of resources used in the run
 * Extensible for future additions like model settings, files, etc.
 */
export interface RunSnapshot {
  prompt: {
    name: string
    userPrompt: string
    annotationSchema: any[]
    annotationType: string
    version: number
  }
  model: {
    code: string
    provider: string
    name: string
  }
}

interface BuildPromptSnapshotProps {
  promptId: string;
  promptVersionNumber: number;
}

interface BuildModelSnapshotProps {
  modelCode: string;
}

/**
 * Builds a prompt snapshot from the database
 * Captures the exact prompt and version state used in the run
 * Stores the complete objects for future-proof reconstruction
 */
async function buildPromptSnapshot({
  promptId,
  promptVersionNumber
}: BuildPromptSnapshotProps) {
  const prompt = await PromptService.findById(promptId);
  const promptVersion = await PromptVersionService.findOne({
    prompt: promptId,
    version: promptVersionNumber
  });

  if (!promptVersion) {
    throw new Error(`Prompt version not found: ${promptId} v${promptVersionNumber}`);
  }

  if (!prompt) {
    throw new Error(`Prompt not found: ${promptId}`);
  }

  return {
    name: prompt.name,
    userPrompt: promptVersion.userPrompt,
    annotationSchema: promptVersion.annotationSchema,
    annotationType: prompt.annotationType,
    version: promptVersion.version
  };
}

/**
 * Builds a model snapshot from the configuration
 * Stores the model code and provider for reproducibility and extensibility
 */
import findModelByCode from "~/modules/llm/helpers/findModelByCode";

async function buildModelSnapshot({
  modelCode,
}: BuildModelSnapshotProps) {
  // Look up the display name for the model
  const modelInfo = findModelByCode(modelCode);
  if (!modelInfo) {
    throw new Error(`Model not found: ${modelCode}`);
  }
  return {
    code: modelCode,
    provider: modelInfo.provider,
    name: modelInfo.name
  };
}

/**
 * Main snapshot builder that composes all sections
 * Add new snapshot types here as they're needed
 */
export async function buildRunSnapshot(
  {
    promptId,
    promptVersionNumber,
    modelCode
  }: {
    promptId: string;
    promptVersionNumber: number;
    modelCode: string;
  }
): Promise<RunSnapshot> {
  const snapshot: RunSnapshot = {
    prompt: await buildPromptSnapshot({ promptId, promptVersionNumber }),
    model: await buildModelSnapshot({ modelCode })
  };

  return snapshot;
}

export default buildRunSnapshot;
