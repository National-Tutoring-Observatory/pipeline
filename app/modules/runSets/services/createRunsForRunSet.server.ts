import { RunService } from "~/modules/runs/run";
import type { RunAnnotationType } from "~/modules/runs/runs.types";
import getUsedPromptModels, {
  buildUsedPromptModelKey,
  buildUsedPromptModelSet,
} from "../helpers/getUsedPromptModels";
import { RunSetService } from "../runSet";
import type { PromptReference, RunSet } from "../runSets.types";

export interface CreateRunsForRunSetPayload {
  runSetId: string;
  prompts: PromptReference[];
  models: string[];
  shouldRunVerification?: boolean;
}

export interface CreateRunsForRunSetResult {
  runSet: RunSet | null;
  errors: string[];
  createdRunIds: string[];
}

export default async function createRunsForRunSet(
  payload: CreateRunsForRunSetPayload,
): Promise<CreateRunsForRunSetResult> {
  const runSet = await RunSetService.findById(payload.runSetId);
  if (!runSet) {
    return {
      runSet: null,
      errors: ["Run set not found"],
      createdRunIds: [],
    };
  }

  const existingRuns = runSet.runs?.length
    ? await RunService.find({ match: { _id: { $in: runSet.runs } } })
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
      const runName = `${runSet.name} - ${promptLabel} - ${model}`;

      try {
        const newRun = await RunService.create({
          project: runSet.project,
          name: runName,
          sessions: runSet.sessions || [],
          annotationType: runSet.annotationType as RunAnnotationType,
          prompt: prompt.promptId,
          promptVersion: prompt.version,
          modelCode: model,
          shouldRunVerification: !!payload.shouldRunVerification,
        });

        generatedRunIds.push(newRun._id);

        await RunService.start(newRun);
      } catch (error) {
        runErrors.push(
          `Error creating run for prompt ${prompt.promptId} and model ${model}: ${error}`,
        );
      }
    }
  }

  const updatedRunSet = await RunSetService.updateById(runSet._id, {
    runs: [...(runSet.runs || []), ...generatedRunIds],
    hasExportedCSV: false,
    hasExportedJSONL: false,
  });

  return {
    runSet: updatedRunSet || runSet,
    errors: runErrors,
    createdRunIds: generatedRunIds,
  };
}
