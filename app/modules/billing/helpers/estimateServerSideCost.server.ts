import { LlmCostService } from "~/modules/llmCosts/llmCost";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import { calculateEstimates } from "~/modules/runSets/helpers/calculateEstimates";
import { SessionService } from "~/modules/sessions/session";

interface CostDefinition {
  modelCode: string;
  prompt: { promptId: string; version: number };
}

async function fetchPromptTokens(
  definitions: CostDefinition[],
): Promise<Map<string, number | undefined>> {
  const unique = new Map<string, { promptId: string; version: number }>();
  for (const def of definitions) {
    const key = `${def.prompt.promptId}:${def.prompt.version}`;
    if (!unique.has(key)) {
      unique.set(key, {
        promptId: def.prompt.promptId,
        version: def.prompt.version,
      });
    }
  }

  const entries = Array.from(unique.entries());
  const docs = await Promise.all(
    entries.map(([, pv]) =>
      PromptVersionService.findOne({
        prompt: pv.promptId,
        version: pv.version,
      }),
    ),
  );

  const result = new Map<string, number | undefined>();
  entries.forEach(([key], i) => {
    result.set(key, docs[i]?.inputTokens);
  });
  return result;
}

export async function estimateServerSideCost({
  teamId,
  sessionIds,
  definitions,
  shouldRunVerification,
}: {
  teamId: string;
  sessionIds: string[];
  definitions: CostDefinition[];
  shouldRunVerification: boolean;
}): Promise<number> {
  const [sessions, outputToInputRatio, promptTokens] = await Promise.all([
    SessionService.find({
      match: { _id: { $in: sessionIds } },
      select: "_id inputTokens",
    }),
    LlmCostService.getOutputToInputRatio(teamId),
    fetchPromptTokens(definitions),
  ]);

  const runDefinitions = definitions.map((def) => ({
    modelCode: def.modelCode,
    prompt: {
      inputTokens: promptTokens.get(
        `${def.prompt.promptId}:${def.prompt.version}`,
      ),
    },
  }));

  const { estimatedCost } = calculateEstimates(runDefinitions, sessions, {
    shouldRunVerification,
    outputToInputRatio,
  });

  return estimatedCost;
}
