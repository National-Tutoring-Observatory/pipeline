import { useState } from "react";
import { getDefaultModelCode } from "~/modules/llm/modelRegistry";
import AdjudicationDialog from "../components/adjudicationDialog";
import type { Evaluation } from "../evaluations.types";
import getTopPerformersVsGoldLabel from "../helpers/getTopPerformersVsGoldLabel";

export default function AdjudicationDialogContainer({
  evaluation,
  onStartAdjudication,
}: {
  evaluation: Evaluation;
  onStartAdjudication: (selectedRuns: string[], modelCode: string) => void;
}) {
  const report = evaluation.report || [];
  const firstReport = report[0];
  const performers = firstReport
    ? getTopPerformersVsGoldLabel(firstReport, evaluation.baseRun)
    : [];
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
        onStartAdjudication(selectedRuns, selectedModel)
      }
    />
  );
}
