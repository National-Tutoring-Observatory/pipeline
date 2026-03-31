export interface PairwiseResult {
  runA: string;
  runB: string;
  kappa: number;
  sampleSize: number;
  precision?: number;
  recall?: number;
  f1?: number;
}

export interface RunSummary {
  runId: string;
  runName: string;
  isHuman: boolean;
  isAdjudication: boolean;
  meanKappaWithOthers: number;
}

export interface EvaluationReport {
  fieldKey: string;
  meanKappa: number;
  pairwise: PairwiseResult[];
  runSummaries: RunSummary[];
}

export interface VerificationMetrics {
  kappa: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface VerificationRunMetrics {
  runId: string;
  runName: string;
  pre: VerificationMetrics;
  post: VerificationMetrics;
  delta: VerificationMetrics;
  sampleSize: number;
}

export interface VerificationFieldReport {
  fieldKey: string;
  runs: VerificationRunMetrics[];
}

export interface Evaluation {
  _id: string;
  name: string;
  project: string;
  runSet: string;
  baseRun: string;
  runs: string[];
  annotationFields: string[];
  isRunning?: boolean;
  isComplete?: boolean;
  hasErrored?: boolean;
  startedAt?: string;
  finishedAt?: string;
  report?: EvaluationReport[];
  verificationReport?: VerificationFieldReport[];
  isExporting?: boolean;
  createdAt?: string;
}
