import { findModelByCode } from "~/modules/llm/modelRegistry";
import { RunService } from "~/modules/runs/run";
import type { RunAnnotationType } from "~/modules/runs/runs.types";
import { RunSetService } from "~/modules/runSets/runSet";

interface CreateAdjudicationRunParams {
  evaluationId: string;
  selectedRunIds: string[];
  modelCode: string;
  projectId: string;
  runSetId: string;
  promptId: string;
  promptVersion: number;
}

export default async function createAdjudicationRun(
  params: CreateAdjudicationRunParams,
) {
  const {
    evaluationId,
    selectedRunIds,
    modelCode,
    projectId,
    runSetId,
    promptId,
    promptVersion,
  } = params;

  console.log("[createAdjudicationRun] Starting", {
    evaluationId,
    selectedRunIds,
    modelCode,
  });

  const runSet = await RunSetService.findById(runSetId);
  if (!runSet) {
    console.log("[createAdjudicationRun] RunSet not found:", runSetId);
    return;
  }

  const annotationType = runSet.annotationType || "PER_UTTERANCE";

  // Create the run
  const modelInfo = findModelByCode(modelCode);
  const runName = `Adjudication - ${modelInfo?.name || modelCode}`;

  const run = await RunService.create({
    project: projectId,
    name: runName,
    sessions: runSet.sessions || [],
    annotationType: annotationType as RunAnnotationType,
    prompt: promptId,
    promptVersion,
    modelCode,
    shouldRunVerification: false,
    isAdjudication: true,
    adjudication: {
      sourceRuns: selectedRunIds,
    },
  });

  console.log("[createAdjudicationRun] Run created:", run._id, run.name);

  // Add the run to the RunSet
  await RunSetService.updateById(runSetId, {
    runs: [...(runSet.runs || []), run._id],
  });

  console.log("[createAdjudicationRun] Run added to RunSet");

  // Start the run — reuses the standard ANNOTATE_RUN worker pipeline.
  // The worker will detect isAdjudication and adjust behaviour.
  await RunService.start(run);

  console.log("[createAdjudicationRun] Run started");
}
