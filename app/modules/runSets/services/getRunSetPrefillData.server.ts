import { findModelByCode } from "~/modules/llm/modelRegistry";
import { PromptService } from "~/modules/prompts/prompt";
import { getRunModelCode } from "~/modules/runs/helpers/runModel";
import { RunService } from "~/modules/runs/run";
import { RunSetService } from "~/modules/runSets/runSet";
import type {
  PrefillData,
  PromptReference,
} from "~/modules/runSets/runSets.types";

export interface PrefillResult {
  prefillData: PrefillData | null;
  prefillSessionIds: string[];
}

export async function getPrefillDataFromRun(
  runId: string,
  projectId: string,
): Promise<PrefillResult> {
  const run = await RunService.findOne({ _id: runId, project: projectId });

  if (!run || run.isHuman) {
    return { prefillData: null, prefillSessionIds: [] };
  }

  const sessionIds = run.sessions.map((s) => s.sessionId);
  const prompt = await PromptService.findById(run.prompt as string);
  const modelCode = getRunModelCode(run);

  return {
    prefillData: {
      sourceRunId: run._id,
      sourceRunName: run.name,
      annotationType: run.annotationType,
      selectedPrompts: [
        {
          promptId: run.prompt as string,
          promptName: prompt?.name || "",
          version: run.promptVersion ?? 0,
        },
      ],
      selectedModels: modelCode ? [modelCode] : [],
      shouldRunVerification: run.shouldRunVerification ?? false,
      selectedSessions: [],
    },
    prefillSessionIds: sessionIds,
  };
}

export async function getPrefillDataFromRunSet(
  runSetId: string,
  projectId: string,
): Promise<PrefillResult> {
  const runSet = await RunSetService.findOne({
    _id: runSetId,
    project: projectId,
  });

  if (!runSet) {
    return { prefillData: null, prefillSessionIds: [] };
  }

  const validationErrors: string[] = [];

  const runs = runSet.runs?.length
    ? await RunService.find({
        match: { _id: { $in: runSet.runs }, project: projectId },
      })
    : [];

  if (runs.length === 0) {
    validationErrors.push("Source runSet has no runs to use as template");
  }

  const annotationType = runs[0]?.annotationType || runSet.annotationType;

  const promptMap = new Map<string, { promptId: string; version: number }>();
  const modelSet = new Set<string>();
  let shouldRunVerification = false;

  for (const run of runs) {
    if (run.isHuman) continue;
    if (run.shouldRunVerification) shouldRunVerification = true;
    const key = `${run.prompt}-${run.promptVersion}`;
    if (!promptMap.has(key)) {
      promptMap.set(key, {
        promptId: run.prompt as string,
        version: run.promptVersion ?? 0,
      });
    }
    const modelCode = getRunModelCode(run);
    if (modelCode) {
      modelSet.add(modelCode);
    }
  }

  if (runs.length > 0 && promptMap.size === 0) {
    validationErrors.push(
      "Source runSet has no LLM runs to use as template; all runs are human-annotated",
    );
  }

  const promptIds = Array.from(promptMap.values()).map((p) => p.promptId);
  const prompts = await PromptService.find({
    match: { _id: { $in: promptIds } },
  });
  const promptsById = new Map(prompts.map((p) => [p._id, p]));

  const selectedPrompts: PromptReference[] = [];
  for (const [, promptRef] of promptMap) {
    const prompt = promptsById.get(promptRef.promptId);
    if (prompt) {
      selectedPrompts.push({
        promptId: promptRef.promptId,
        promptName: prompt.name,
        version: promptRef.version,
      });
    } else {
      validationErrors.push(`Prompt "${promptRef.promptId}" no longer exists`);
    }
  }

  const selectedModels: string[] = [];
  for (const modelCode of modelSet) {
    if (findModelByCode(modelCode)) {
      selectedModels.push(modelCode);
    } else {
      validationErrors.push(`Model "${modelCode}" is no longer available`);
    }
  }

  return {
    prefillData: {
      sourceRunSetId: runSet._id,
      sourceRunSetName: runSet.name,
      annotationType,
      selectedPrompts,
      selectedModels,
      shouldRunVerification,
      selectedSessions: [],
      validationErrors:
        validationErrors.length > 0 ? validationErrors : undefined,
    },
    prefillSessionIds: runSet.sessions || [],
  };
}
