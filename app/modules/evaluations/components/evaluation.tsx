import { Button } from "@/components/ui/button";
import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { Evaluation as EvaluationType } from "~/modules/evaluations/evaluations.types";
import Flag from "~/modules/featureFlags/components/flag";
import buildPairwiseMatrix from "../helpers/buildPairwiseMatrix";
import getPairDetails from "../helpers/getPairDetails";
import getTopPerformersVsGoldLabel from "../helpers/getTopPerformersVsGoldLabel";
import getVerificationImpactData from "../helpers/getVerificationImpactData";
import EvaluationPairDetails from "./evaluationPairDetails";
import EvaluationPairwiseMatrix from "./evaluationPairwiseMatrix";
import EvaluationTopPerformers from "./evaluationTopPerformers";
import EvaluationVerificationImpact from "./evaluationVerificationImpact";

export default function Evaluation({
  evaluation,
  breadcrumbs,
  progress,
  canStartAdjudication,
  onAdjudicationClicked,
}: {
  evaluation: EvaluationType;
  breadcrumbs: Breadcrumb[];
  progress: number;
  canStartAdjudication: boolean;
  onAdjudicationClicked: () => void;
}) {
  const runCount = evaluation.runs?.length || 0;
  const report = evaluation.report || [];
  const verificationReport = evaluation.verificationReport || [];

  const goldLabelRunName =
    report[0]?.runSummaries.find(
      (summary) => summary.runId === evaluation.baseRun,
    )?.runName || "Gold Label";

  return (
    <div className="px-8 py-8">
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
              Processing evaluation
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

        {canStartAdjudication && (
          <Flag flag="HAS_ADJUDICATION">
            <Button variant="outline" onClick={onAdjudicationClicked}>
              Improve via adjudication
            </Button>
          </Flag>
        )}

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
                <div className="space-y-12">
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
                  <EvaluationPairDetails pairs={getPairDetails(fieldReport)} />
                  {(() => {
                    const fieldVerificationReport = verificationReport.find(
                      (vr) => vr.fieldKey === fieldReport.fieldKey,
                    );
                    return fieldVerificationReport &&
                      fieldVerificationReport.runs.length > 0 ? (
                      <EvaluationVerificationImpact
                        rows={getVerificationImpactData(
                          fieldVerificationReport,
                        )}
                        goldLabelRunName={goldLabelRunName}
                      />
                    ) : null;
                  })()}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
