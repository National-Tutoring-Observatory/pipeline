import type { Evaluation as EvaluationType } from "~/modules/evaluations/evaluations.types";

export default function Evaluation({
  evaluation,
}: {
  evaluation: EvaluationType;
}) {
  const runCount = evaluation.runs?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{evaluation.name}</h1>
        <p className="text-muted-foreground">
          {runCount} run{runCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
