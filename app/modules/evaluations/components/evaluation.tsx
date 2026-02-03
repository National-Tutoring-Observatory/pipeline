import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { Evaluation as EvaluationType } from "~/modules/evaluations/evaluations.types";

export default function Evaluation({
  evaluation,
  breadcrumbs,
}: {
  evaluation: EvaluationType;
  breadcrumbs: Breadcrumb[];
}) {
  const runCount = evaluation.runs?.length || 0;

  return (
    <div className="px-8 pt-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>

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
