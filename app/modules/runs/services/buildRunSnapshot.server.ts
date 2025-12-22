import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";

/**
 * Snapshot sections that can be added to a run
 * Stores complete frozen state of resources used in the run
 * Extensible for future additions like model settings, files, etc.
 */
export interface RunSnapshot {
  prompt: {
    name: string;
    userPrompt: string;
    annotationSchema: any[];
    annotationType: string;
    version: number;
  };
}

interface BuildPromptSnapshotProps {
  promptId: string;
  promptVersionNumber: number;
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
  const documents = getDocumentsAdapter();

  const promptDoc = await documents.getDocument<Prompt>({
    collection: 'prompts',
    match: { _id: promptId }
  });

  const promptVersionDoc = await documents.getDocument<PromptVersion>({
    collection: 'promptVersions',
    match: { prompt: promptId, version: promptVersionNumber }
  });

  if (!promptVersionDoc.data) {
    throw new Error(`Prompt version not found: ${promptId} v${promptVersionNumber}`);
  }

  if (!promptDoc.data) {
    throw new Error(`Prompt not found: ${promptId}`);
  }

  return {
    prompt: promptDoc.data,
    promptVersion: promptVersionDoc.data
  };
}

/**
 * Main snapshot builder that composes all sections
 * Add new snapshot types here as they're needed
 */
export async function buildRunSnapshot(
  {
    promptId,
    promptVersionNumber
  }: {
    promptId: string;
    promptVersionNumber: number;
  }
): Promise<RunSnapshot> {
  const { prompt, promptVersion } = await buildPromptSnapshot({
    promptId,
    promptVersionNumber
  });

  const snapshot: RunSnapshot = {
    prompt: {
      name: prompt.name,
      userPrompt: promptVersion.userPrompt,
      annotationSchema: promptVersion.annotationSchema,
      annotationType: prompt.annotationType,
      version: promptVersion.version
    }
  };

  return snapshot;
}

export default buildRunSnapshot;
