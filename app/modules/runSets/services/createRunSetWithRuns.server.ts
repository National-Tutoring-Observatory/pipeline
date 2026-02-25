import { RunService } from "~/modules/runs/run";
import type { RunAnnotationType } from "~/modules/runs/runs.types";
import { RunSetService } from "../runSet";
import type { PromptReference, RunSet } from "../runSets.types";

export interface CreateRunSetWithRunsPayload {
  project: string;
  name: string;
  sessions: string[];
  prompts: PromptReference[];
  models: string[];
  annotationType: RunAnnotationType;
  shouldRunVerification?: boolean;
}

export default async function createRunSetWithRuns(
  payload: CreateRunSetWithRunsPayload,
): Promise<{ runSet: RunSet; errors: string[] }> {
  const runSet = await RunSetService.create({
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
      const runName = `${runSet.name} - ${promptLabel} - ${model}`;

      try {
        const newRun = await RunService.create({
          project: payload.project,
          name: runName,
          sessions: payload.sessions,
          annotationType: payload.annotationType,
          prompt: prompt.promptId,
          promptVersion: prompt.version,
          modelCode: model,
          shouldRunVerification: !!payload.shouldRunVerification,
        });

        generatedRunIds.push(newRun._id);

        await RunService.start(newRun);
      } catch (error) {
        runErrors.push(
          `Error starting run for prompt ${prompt.promptId} and model ${model}: ${error}`,
        );
      }
    }
  }

  const updatedRunSet = await RunSetService.updateById(runSet._id, {
    runs: generatedRunIds,
  });

  return {
    runSet: updatedRunSet || runSet,
    errors: runErrors,
  };
}
