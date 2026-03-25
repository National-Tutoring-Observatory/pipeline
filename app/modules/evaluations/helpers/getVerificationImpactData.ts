import type { VerificationFieldReport } from "../evaluations.types";

export interface VerificationImpactRow {
  runId: string;
  runName: string;
  preKappa: number;
  postKappa: number;
  deltaKappa: number;
  prePrecision: number;
  postPrecision: number;
  deltaPrecision: number;
  preRecall: number;
  postRecall: number;
  deltaRecall: number;
  preF1: number;
  postF1: number;
  deltaF1: number;
  sampleSize: number;
}

export default function getVerificationImpactData(
  fieldReport: VerificationFieldReport,
): VerificationImpactRow[] {
  console.log("getVerificationImpactData", fieldReport);

  return fieldReport.runs
    .map((run) => ({
      runId: run.runId,
      runName: run.runName,
      preKappa: run.pre.kappa,
      postKappa: run.post.kappa,
      deltaKappa: run.delta.kappa,
      prePrecision: run.pre.precision,
      postPrecision: run.post.precision,
      deltaPrecision: run.delta.precision,
      preRecall: run.pre.recall,
      postRecall: run.post.recall,
      deltaRecall: run.delta.recall,
      preF1: run.pre.f1,
      postF1: run.post.f1,
      deltaF1: run.delta.f1,
      sampleSize: run.sampleSize,
    }))
    .sort((a, b) => b.deltaKappa - a.deltaKappa);
}
