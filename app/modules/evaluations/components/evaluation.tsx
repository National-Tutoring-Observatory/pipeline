import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { Progress } from "@/components/ui/progress";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { Evaluation as EvaluationType } from "~/modules/evaluations/evaluations.types";

export default function Evaluation({
  evaluation,
  breadcrumbs,
  progress,
  step,
}: {
  evaluation: EvaluationType;
  breadcrumbs: Breadcrumb[];
  progress: number;
  step: string;
}) {
  const runCount = evaluation.runs?.length || 0;

  return (
    <div className="px-8 pt-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>

      <div className="relative mb-8">
        {evaluation.isRunning && (
          <div>
            <Progress value={progress} />
            <div className="mt-1 text-right text-xs opacity-40">
              Processing {step}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{evaluation.name}</h1>
          <p className="text-muted-foreground">
            {runCount} run{runCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
