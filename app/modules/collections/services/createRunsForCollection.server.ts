import startRun from "~/modules/projects/services/startRun.server";
import { RunService } from "~/modules/runs/run";
import type { RunAnnotationType } from "~/modules/runs/runs.types";
import { CollectionService } from "../collection";
import type { Collection, PromptReference } from "../collections.types";
import getUsedPromptModels, {
  buildUsedPromptModelKey,
  buildUsedPromptModelSet,
} from "../helpers/getUsedPromptModels";

export interface CreateRunsForCollectionPayload {
  collectionId: string;
  prompts: PromptReference[];
  models: string[];
}

export interface CreateRunsForCollectionResult {
  collection: Collection | null;
  errors: string[];
  createdRunIds: string[];
}

export default async function createRunsForCollection(
  payload: CreateRunsForCollectionPayload,
): Promise<CreateRunsForCollectionResult> {
  const collection = await CollectionService.findById(payload.collectionId);
  if (!collection) {
    return {
      collection: null,
      errors: ["Collection not found"],
      createdRunIds: [],
    };
  }

  const existingRuns = collection.runs?.length
    ? await RunService.find({ match: { _id: { $in: collection.runs } } })
    : [];

  const usedPairs = getUsedPromptModels(existingRuns);
  const usedKeys = buildUsedPromptModelSet(usedPairs);

  const generatedRunIds: string[] = [];
  const runErrors: string[] = [];

  for (const prompt of payload.prompts) {
    for (const model of payload.models) {
      const key = buildUsedPromptModelKey(
        prompt.promptId,
        prompt.version,
        model,
      );
      if (usedKeys.has(key)) {
        continue;
      }

      const promptLabel = prompt.promptName
        ? `${prompt.promptName} v${prompt.version}`
        : prompt.promptId;
      const runName = `${collection.name} - ${promptLabel} - ${model}`;

      const newRun = await RunService.create({
        project: collection.project,
        name: runName,
        annotationType: collection.annotationType as RunAnnotationType,
        isRunning: false,
        isComplete: false,
      });

      generatedRunIds.push(newRun._id);

      try {
        const startedRun = await startRun({
          runId: newRun._id,
          projectId: collection.project,
          sessions: collection.sessions || [],
          annotationType: collection.annotationType as RunAnnotationType,
          prompt: prompt.promptId,
          promptVersion: prompt.version,
          modelCode: model,
        });

        if (!startedRun) {
          runErrors.push(
            `Failed to start run for prompt ${prompt.promptId} and model ${model}`,
          );
          continue;
        }

        await RunService.createAnnotations(startedRun);
      } catch (error) {
        runErrors.push(
          `Error creating run for prompt ${prompt.promptId} and model ${model}: ${error}`,
        );
      }
    }
  }

  const updatedCollection = await CollectionService.updateById(collection._id, {
    runs: [...(collection.runs || []), ...generatedRunIds],
    hasExportedCSV: false,
    hasExportedJSONL: false,
  });

  return {
    collection: updatedCollection || collection,
    errors: runErrors,
    createdRunIds: generatedRunIds,
  };
}
