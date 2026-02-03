import startRun from "~/modules/projects/services/startRun.server";
import { RunService } from "~/modules/runs/run";
import type { RunAnnotationType } from "~/modules/runs/runs.types";
import { CollectionService } from "../collection";
import type { Collection, PromptReference } from "../collections.types";

export interface CreateCollectionWithRunsPayload {
  project: string;
  name: string;
  sessions: string[];
  prompts: PromptReference[];
  models: string[];
  annotationType: RunAnnotationType;
}

export default async function createCollectionWithRuns(
  payload: CreateCollectionWithRunsPayload,
): Promise<{ collection: Collection; errors: string[] }> {
  const collection = await CollectionService.create({
    project: payload.project,
    name: payload.name,
    sessions: payload.sessions,
    runs: [],
    annotationType: payload.annotationType,
  });

  const generatedRunIds: string[] = [];
  const runErrors: string[] = [];

  for (const prompt of payload.prompts) {
    for (const model of payload.models) {
      const promptLabel = prompt.promptName
        ? `${prompt.promptName} v${prompt.version}`
        : prompt.promptId;
      const runName = `${collection.name} - ${promptLabel} - ${model}`;

      const newRun = await RunService.create({
        project: payload.project,
        name: runName,
        annotationType: payload.annotationType,
        isRunning: false,
        isComplete: false,
      });

      generatedRunIds.push(newRun._id);

      try {
        const startedRun = await startRun({
          runId: newRun._id,
          projectId: payload.project,
          sessions: payload.sessions,
          annotationType: payload.annotationType,
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
    runs: generatedRunIds,
  });

  return {
    collection: updatedCollection || collection,
    errors: runErrors,
  };
}
