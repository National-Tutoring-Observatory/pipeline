import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";

/**
 * Snapshot sections that can be added to a run
 * Stores complete frozen state of resources used in the run
 * Extensible for future additions like model settings, files, etc.
 */
export interface RunSnapshot {
  prompt: Prompt;
  promptVersion: PromptVersion;
}

interface BuildPromptSnapshotProps {
  promptId: string;
  promptVersion: number;
}

/**
 * Builds a prompt snapshot from the database
 * Captures the exact prompt and version state used in the run
 * Stores the complete objects for future-proof reconstruction
 */
async function buildPromptSnapshot({
  promptId,
  promptVersion
}: BuildPromptSnapshotProps) {
  const documents = getDocumentsAdapter();

  const promptDoc = await documents.getDocument<Prompt>({
    collection: 'prompts',
    match: { _id: promptId }
  });

  const promptVersionDoc = await documents.getDocument<PromptVersion>({
    collection: 'promptVersions',
    match: { prompt: promptId, version: promptVersion }
  });

  if (!promptVersionDoc.data) {
    throw new Error(`Prompt version not found: ${promptId} v${promptVersion}`);
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
    promptVersion: promptVersionNumber
  });

  const snapshot: RunSnapshot = {
    prompt,
    promptVersion,
  };

  return snapshot;
}

export default buildRunSnapshot;
