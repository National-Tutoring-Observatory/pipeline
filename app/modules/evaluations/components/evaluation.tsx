import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { Evaluation as EvaluationType } from "~/modules/evaluations/evaluations.types";
import buildPairwiseMatrix from "../helpers/buildPairwiseMatrix";
import getTopPerformersVsGoldLabel from "../helpers/getTopPerformersVsGoldLabel";
import EvaluationPairwiseMatrix from "./evaluationPairwiseMatrix";
import EvaluationTopPerformers from "./evaluationTopPerformers";

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
  const report = evaluation.report || [];

  const goldLabelRunName =
    report[0]?.runSummaries.find(
      (summary) => summary.runId === evaluation.baseRun,
    )?.runName || "Gold Label";

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

        {evaluation.isComplete && report.length > 0 && (
          <Tabs defaultValue={report[0].fieldKey}>
            <p className="text-muted-foreground mb-2 text-sm">
              This shows an evaluation based upon the following annotation
              schema field:
            </p>
            <TabsList>
              {report.map((fieldReport) => (
                <TabsTrigger
                  key={fieldReport.fieldKey}
                  value={fieldReport.fieldKey}
                >
                  {fieldReport.fieldKey}
                </TabsTrigger>
              ))}
            </TabsList>
            {report.map((fieldReport) => (
              <TabsContent
                key={fieldReport.fieldKey}
                value={fieldReport.fieldKey}
              >
                <div className="space-y-6">
                  <EvaluationTopPerformers
                    performers={getTopPerformersVsGoldLabel(
                      fieldReport,
                      evaluation.baseRun,
                    )}
                    goldLabelRunName={goldLabelRunName}
                  />
                  <EvaluationPairwiseMatrix
                    matrix={buildPairwiseMatrix(fieldReport)}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
