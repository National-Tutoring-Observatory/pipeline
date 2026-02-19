import type { TopPerformer } from "../helpers/getTopPerformersVsGoldLabel";
import EvaluationTopPerformersItem from "./evaluationTopPerformersItem";

export default function EvaluationTopPerformers({
  performers,
  goldLabelRunName,
}: {
  performers: TopPerformer[];
  goldLabelRunName: string;
}) {
  if (performers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Top Performers vs Gold Label</h2>
        <p className="text-muted-foreground text-sm">
          Ranked by agreement with {goldLabelRunName}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {performers.map((performer) => (
          <EvaluationTopPerformersItem
            key={performer.runId}
            performer={performer}
          />
        ))}
      </div>
    </div>
  );
}
