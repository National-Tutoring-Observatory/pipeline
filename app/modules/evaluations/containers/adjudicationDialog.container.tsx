import { useState } from "react";
import { getDefaultModelCode } from "~/modules/llm/modelRegistry";
import AdjudicationDialog from "../components/adjudicationDialog";
import type { EvaluationReport } from "../evaluations.types";
import getTopPerformersVsGoldLabel from "../helpers/getTopPerformersVsGoldLabel";

export default function AdjudicationDialogContainer({
  report,
  baseRun,
  evaluationPrompt,
  onStartAdjudication,
}: {
  report: EvaluationReport | null;
  baseRun: string;
  evaluationPrompt: { promptId: string; promptVersion: number } | null;
  onStartAdjudication: (
    selectedRuns: string[],
    modelCode: string,
    promptId: string,
    promptVersion: number,
  ) => void;
}) {
  const performers = report ? getTopPerformersVsGoldLabel(report, baseRun) : [];
  const nonHumanPerformers = performers.filter((p) => !p.isHuman);

  const initialSelection = nonHumanPerformers.slice(0, 3).map((p) => p.runId);
  const [selectedRuns, setSelectedRuns] = useState<string[]>(initialSelection);
  const [selectedModel, setSelectedModel] = useState(getDefaultModelCode());

  return (
    <AdjudicationDialog
      performers={nonHumanPerformers}
      selectedRuns={selectedRuns}
      selectedModel={selectedModel}
      onSelectedRunsChanged={setSelectedRuns}
      onSelectedModelChanged={setSelectedModel}
      onStartAdjudication={() =>
        evaluationPrompt &&
        onStartAdjudication(
          selectedRuns,
          selectedModel,
          evaluationPrompt.promptId,
          evaluationPrompt.promptVersion,
        )
      }
    />
  );
}
