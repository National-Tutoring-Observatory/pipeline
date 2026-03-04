export interface PairwiseResult {
  runA: string;
  runB: string;
  kappa: number;
  sampleSize: number;
}

export interface RunSummary {
  runId: string;
  runName: string;
  meanKappaWithOthers: number;
}

export interface EvaluationReport {
  fieldKey: string;
  meanKappa: number;
  pairwise: PairwiseResult[];
  runSummaries: RunSummary[];
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
  isExporting?: boolean;
  createdAt?: string;
}
