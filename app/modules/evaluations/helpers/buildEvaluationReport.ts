import fse from "fs-extra";
import type { Run, RunSession } from "~/modules/runs/runs.types";
import { SessionService } from "~/modules/sessions/session";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import type {
  Evaluation,
  EvaluationReport,
  PairwiseResult,
  RunSummary,
} from "../evaluations.types";
import calculateCohensKappa from "./calculateCohensKappa";
import calculateMeanKappa from "./calculateMeanKappa";
import extractAnnotationValues from "./extractAnnotationValues";

interface SessionFileCache {
  [runId: string]: {
    [sessionId: string]: any;
  };
}

async function downloadSessionFile(
  projectId: string,
  runId: string,
  sessionId: string,
  sessionName: string,
): Promise<any> {
  const storage = getStorageAdapter();
  const sourcePath = `storage/${projectId}/runs/${runId}/${sessionId}/${sessionName}`;
  const downloadedPath = await storage.download({ sourcePath });
  return fse.readJSON(downloadedPath);
}

async function loadAllSessionFiles(
  evaluation: Evaluation,
  runs: Run[],
): Promise<SessionFileCache> {
  const cache: SessionFileCache = {};
  const projectId = evaluation.project;

  for (const run of runs) {
    cache[run._id] = {};
    for (const runSession of run.sessions) {
      if (runSession.status !== "DONE") continue;

      const session = await SessionService.findById(runSession.sessionId);
      if (!session) continue;

      const sessionJSON = await downloadSessionFile(
        projectId,
        run._id,
        runSession.sessionId,
        session.name,
      );
      cache[run._id][runSession.sessionId] = sessionJSON;
    }
  }

  return cache;
}

function getCommonSessionIds(runs: Run[]): string[] {
  if (runs.length === 0) return [];

  const firstRunSessionIds = runs[0].sessions
    .filter((session: RunSession) => session.status === "DONE")
    .map((session: RunSession) => session.sessionId);

  return firstRunSessionIds.filter((sessionId: string) =>
    runs.every((run) =>
      run.sessions.some(
        (session: RunSession) =>
          session.sessionId === sessionId && session.status === "DONE",
      ),
    ),
  );
}

function buildLabelsForRun(
  runId: string,
  sessionIds: string[],
  fieldKey: string,
  annotationType: string,
  cache: SessionFileCache,
): string[] {
  const allLabels: string[] = [];

  for (const sessionId of sessionIds) {
    const sessionJSON = cache[runId]?.[sessionId];
    if (!sessionJSON) continue;

    const values = extractAnnotationValues(
      sessionJSON,
      annotationType,
      fieldKey,
    );
    allLabels.push(...values);
  }

  return allLabels;
}

function generateRunPairs(runIds: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let outer = 0; outer < runIds.length; outer++) {
    for (let inner = outer + 1; inner < runIds.length; inner++) {
      pairs.push([runIds[outer], runIds[inner]]);
    }
  }
  return pairs;
}

export default async function buildEvaluationReport(
  evaluation: Evaluation,
  runs: Run[],
): Promise<EvaluationReport[]> {
  const cache = await loadAllSessionFiles(evaluation, runs);
  const commonSessionIds = getCommonSessionIds(runs);

  if (commonSessionIds.length === 0) {
    return evaluation.annotationFields.map((fieldKey) => ({
      fieldKey,
      meanKappa: 0,
      pairwise: [],
      runSummaries: [],
    }));
  }

  const annotationType =
    runs[0]?.snapshot?.prompt?.annotationType || "PER_SESSION";
  const runIds = runs.map((run) => run._id);
  const runPairs = generateRunPairs(runIds);
  const runNameMap = new Map(runs.map((run) => [run._id, run.name]));

  const reports: EvaluationReport[] = [];

  for (const fieldKey of evaluation.annotationFields) {
    const labelsByRun = new Map<string, string[]>();

    for (const runId of runIds) {
      const labels = buildLabelsForRun(
        runId,
        commonSessionIds,
        fieldKey,
        annotationType,
        cache,
      );
      labelsByRun.set(runId, labels);
    }

    const pairwiseResults: PairwiseResult[] = [];

    for (const [runIdA, runIdB] of runPairs) {
      const labelsA = labelsByRun.get(runIdA) || [];
      const labelsB = labelsByRun.get(runIdB) || [];

      const minLength = Math.min(labelsA.length, labelsB.length);
      const alignedA = labelsA.slice(0, minLength);
      const alignedB = labelsB.slice(0, minLength);

      const kappa = calculateCohensKappa(alignedA, alignedB);

      console.log(kappa);

      pairwiseResults.push({
        runA: runIdA,
        runB: runIdB,
        kappa: Math.round(kappa * 100) / 100,
        sampleSize: minLength,
      });
    }

    const meanKappa = calculateMeanKappa(pairwiseResults);

    const runSummaries: RunSummary[] = runIds.map((runId) => {
      const pairsInvolvingRun = pairwiseResults.filter(
        (pair) => pair.runA === runId || pair.runB === runId,
      );
      const runMeanKappa = calculateMeanKappa(pairsInvolvingRun);

      return {
        runId,
        runName: runNameMap.get(runId) || runId,
        meanKappaWithOthers: runMeanKappa,
      };
    });

    reports.push({
      fieldKey,
      meanKappa,
      pairwise: pairwiseResults,
      runSummaries,
    });
  }

  return reports;
}
