import { useState } from "react";
import AdjudicationDialog from "../components/adjudicationDialog";
import type { Evaluation } from "../evaluations.types";
import getTopPerformersVsGoldLabel from "../helpers/getTopPerformersVsGoldLabel";

export default function AdjudicationDialogContainer({
  evaluation,
  onStartAdjudication,
}: {
  evaluation: Evaluation;
  onStartAdjudication: (selectedRuns: string[]) => void;
}) {
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  const report = evaluation.report || [];
  const firstReport = report[0];
  const performers = firstReport
    ? getTopPerformersVsGoldLabel(firstReport, evaluation.baseRun)
    : [];

  return (
    <AdjudicationDialog
      performers={performers}
      selectedRuns={selectedRuns}
      onSelectedRunsChanged={setSelectedRuns}
      onStartAdjudication={() => onStartAdjudication(selectedRuns)}
    />
  );
}
