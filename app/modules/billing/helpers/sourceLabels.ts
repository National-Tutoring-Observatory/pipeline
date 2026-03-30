import type {
  CostBySource,
  LlmCostSource,
} from "~/modules/llmCosts/llmCosts.types";

const SOURCE_LABELS: Record<LlmCostSource, string> = {
  "annotation:per-session": "Annotation",
  "annotation:per-utterance": "Annotation",
  "verification:per-session": "Verification",
  "verification:per-utterance": "Verification",
  "file-conversion": "File Conversion",
  "codebook-prompt-generation": "Codebook Generation",
  "attribute-mapping": "Attribute Mapping",
  "prompt-alignment": "Prompt Alignment",
  "adjudication:per-utterance": "Adjudication",
  "adjudication:per-session": "Adjudication",
};

export function getSourceLabel(source: string): string {
  return (SOURCE_LABELS as Record<string, string>)[source] ?? source;
}

export function groupCostsBySource(
  costs: CostBySource[],
): Array<{ label: string; totalCost: number }> {
  const grouped = new Map<string, number>();
  for (const cost of costs) {
    const label = getSourceLabel(cost.source);
    grouped.set(label, (grouped.get(label) ?? 0) + cost.totalCost);
  }
  return Array.from(grouped.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([label, totalCost]) => ({ label, totalCost }));
}
