import { LlmCostService } from "~/modules/llmCosts/llmCost";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import { calculateEstimates } from "~/modules/runSets/helpers/calculateEstimates";
import { SessionService } from "~/modules/sessions/session";

interface RunDefinitionInput {
  modelCode: string;
  promptId: string;
  promptVersion: number;
}

export async function estimateServerSideCost({
  teamId,
  sessionIds,
  definitions,
  shouldRunVerification,
}: {
  teamId: string;
  sessionIds: string[];
  definitions: RunDefinitionInput[];
  shouldRunVerification: boolean;
}): Promise<number> {
  const uniquePrompts = new Map<
    string,
    { promptId: string; version: number }
  >();
  for (const def of definitions) {
    const key = `${def.promptId}:${def.promptVersion}`;
    if (!uniquePrompts.has(key)) {
      uniquePrompts.set(key, {
        promptId: def.promptId,
        version: def.promptVersion,
      });
    }
  }

  const promptEntries = Array.from(uniquePrompts.entries());

  const [sessions, outputToInputRatio, ...promptVersionDocs] =
    await Promise.all([
      SessionService.find({
        match: { _id: { $in: sessionIds } },
        select: "_id inputTokens",
      }),
      LlmCostService.getOutputToInputRatio(teamId),
      ...promptEntries.map(([, pv]) =>
        PromptVersionService.findOne({
          prompt: pv.promptId,
          version: pv.version,
        }),
      ),
    ]);

  const promptTokensMap = new Map<string, number | undefined>();
  promptEntries.forEach(([key], i) => {
    promptTokensMap.set(key, promptVersionDocs[i]?.inputTokens);
  });

  const runDefinitions = definitions.map((def) => ({
    modelCode: def.modelCode,
    prompt: {
      inputTokens: promptTokensMap.get(`${def.promptId}:${def.promptVersion}`),
    },
  }));

  const { estimatedCost } = calculateEstimates(runDefinitions, sessions, {
    shouldRunVerification,
    outputToInputRatio,
  });

  return estimatedCost;
}
