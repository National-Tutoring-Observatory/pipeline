import type { Run } from "~/modules/runs/runs.types";
import type {
  Evaluation,
  VerificationFieldReport,
  VerificationMetrics,
  VerificationRunMetrics,
} from "../evaluations.types";
import type { SessionFileCache } from "./buildEvaluationReport";
import calculateCohensKappa from "./calculateCohensKappa";
import calculatePRF1 from "./calculatePRF1";
import extractAnnotationValues from "./extractAnnotationValues";
import extractPreVerificationAnnotationValues from "./extractPreVerificationAnnotationValues";

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildMetrics(
  labels: string[],
  baseLabels: string[],
): VerificationMetrics {
  const minLength = Math.min(labels.length, baseLabels.length);
  const aligned = labels.slice(0, minLength);
  const alignedBase = baseLabels.slice(0, minLength);

  const kappa = calculateCohensKappa(aligned, alignedBase);
  const prf1 = calculatePRF1(aligned, alignedBase);

  return {
    kappa: roundMetric(kappa),
    precision: roundMetric(prf1.precision),
    recall: roundMetric(prf1.recall),
    f1: roundMetric(prf1.f1),
  };
}

export default function buildVerificationReport(
  evaluation: Evaluation,
  runs: Run[],
  cache: SessionFileCache,
  commonSessionIds: string[],
): VerificationFieldReport[] {
  const verifiedRuns = runs.filter(
    (run) => run.shouldRunVerification && run._id !== evaluation.baseRun,
  );

  if (verifiedRuns.length === 0) return [];

  const annotationType =
    runs[0]?.snapshot?.prompt?.annotationType || "PER_SESSION";
  const baseRunId = evaluation.baseRun;
  const runNameMap = new Map(runs.map((run) => [run._id, run.name]));

  const reports: VerificationFieldReport[] = [];

  for (const fieldKey of evaluation.annotationFields) {
    const baseLabels: string[] = [];
    for (const sessionId of commonSessionIds) {
      const sessionJSON = cache[baseRunId]?.[sessionId];
      if (!sessionJSON) continue;
      baseLabels.push(
        ...extractAnnotationValues(sessionJSON, annotationType, fieldKey),
      );
    }

    const runMetrics: VerificationRunMetrics[] = [];

    for (const run of verifiedRuns) {
      const preLabels: string[] = [];
      const postLabels: string[] = [];
      const runBaseLabels: string[] = [];

      for (const sessionId of commonSessionIds) {
        const sessionJSON = cache[run._id]?.[sessionId];
        if (!sessionJSON) continue;

        const hasPreVerification =
          sessionJSON.preVerificationAnnotations &&
          sessionJSON.preVerificationAnnotations.length > 0;

        if (!hasPreVerification) continue;

        const baseSessionJSON = cache[baseRunId]?.[sessionId];
        if (!baseSessionJSON) continue;

        preLabels.push(
          ...extractPreVerificationAnnotationValues(
            sessionJSON,
            annotationType,
            fieldKey,
          ),
        );
        postLabels.push(
          ...extractAnnotationValues(sessionJSON, annotationType, fieldKey),
        );
        runBaseLabels.push(
          ...extractAnnotationValues(baseSessionJSON, annotationType, fieldKey),
        );
      }

      if (preLabels.length === 0) continue;

      const pre = buildMetrics(preLabels, runBaseLabels);
      const post = buildMetrics(postLabels, runBaseLabels);

      const delta: VerificationMetrics = {
        kappa: roundMetric(post.kappa - pre.kappa),
        precision: roundMetric(post.precision - pre.precision),
        recall: roundMetric(post.recall - pre.recall),
        f1: roundMetric(post.f1 - pre.f1),
      };

      const sampleSize = Math.min(preLabels.length, runBaseLabels.length);

      runMetrics.push({
        runId: run._id,
        runName: runNameMap.get(run._id) || run._id,
        pre,
        post,
        delta,
        sampleSize,
      });
    }

    reports.push({ fieldKey, runs: runMetrics });
  }

  return reports;
}
