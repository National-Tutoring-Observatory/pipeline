import { RunService } from '~/modules/runs/run';
import startRun from '~/modules/projects/services/startRun.server';
import type { Collection } from '../collections.types';
import type { RunAnnotationType } from '~/modules/runs/runs.types';
import { CollectionService } from '../collection';

interface CreateCollectionWithRunsPayload {
  projectId: string;
  name: string;
  sessions: string[];
  prompts: Array<{ promptId: string; promptName?: string; version: number }>;
  models: string[];
  annotationType: RunAnnotationType;
}

export default async function createCollectionWithRuns(
  collection: Collection,
  payload: CreateCollectionWithRunsPayload
): Promise<{ collection: Collection; errors: string[] }> {
  const generatedRunIds: string[] = [];
  const runErrors: string[] = [];

  for (const prompt of payload.prompts) {
    for (const model of payload.models) {
      try {
        const runName = `${collection.name} - ${prompt.promptId} - ${model}`;

        const newRun = await RunService.create({
          project: payload.projectId,
          name: runName,
          annotationType: payload.annotationType,
          hasSetup: false,
          isRunning: false,
          isComplete: false
        });

        const startedRun = await startRun({
          runId: newRun._id,
          projectId: payload.projectId,
          sessions: payload.sessions,
          annotationType: payload.annotationType,
          prompt: prompt.promptId,
          promptVersion: prompt.version,
          modelCode: model
        });

        if (!startedRun) {
          runErrors.push(
            `Failed to start run for prompt ${prompt.promptId} and model ${model}`
          );
          continue;
        }

        await RunService.createAnnotations(startedRun);
        generatedRunIds.push(newRun._id);
      } catch (error) {
        runErrors.push(
          `Error creating run for prompt ${prompt.promptId} and model ${model}: ${error}`
        );
      }
    }
  }

  // Update collection with generated run IDs
  const updatedCollection = await CollectionService.updateById(collection._id, {
    runs: generatedRunIds
  });

  return {
    collection: updatedCollection || collection,
    errors: runErrors
  };
}
