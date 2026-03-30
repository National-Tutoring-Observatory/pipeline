import fse from "fs-extra";
import { RunService } from "../../app/modules/runs/run";
import { SessionService } from "../../app/modules/sessions/session";
import getStorageAdapter from "../../app/modules/storage/helpers/getStorageAdapter";

interface BuildAdjudicationPromptParams {
  sessionId: string;
  sourceRunIds: string[];
  projectId: string;
  annotationType: string;
  originalJSON: any;
}

interface SourceRunSession {
  runId: string;
  runName: string;
  sessionJSON: any;
}

interface BuildAdjudicationPromptResult {
  hasDisagreements: boolean;
  adjudicationContext: string;
  firstSourceRunSessionFile: any;
  agreedAnnotations: Map<string, any>;
}

export default async function buildAdjudicationPrompt(
  params: BuildAdjudicationPromptParams,
): Promise<BuildAdjudicationPromptResult> {
  const { sessionId, sourceRunIds, projectId, annotationType, originalJSON } =
    params;

  console.log(
    "[buildAdjudicationPrompt] Loading source runs for session:",
    sessionId,
  );

  const sourceRuns = await RunService.find({
    match: { _id: { $in: sourceRunIds } },
  });

  console.log(
    "[buildAdjudicationPrompt] Source runs:",
    sourceRuns.map((r) => r.name),
  );

  // Get non-system annotation field keys from the first source run's snapshot
  const annotationSchema =
    sourceRuns[0]?.snapshot?.prompt?.annotationSchema || [];
  const fieldKeys = annotationSchema
    .filter((field: any) => !field.isSystem)
    .map((field: any) => field.fieldKey);

  console.log(
    "[buildAdjudicationPrompt] Annotation fields to compare:",
    fieldKeys,
  );

  // Load session files for each source run
  const storage = getStorageAdapter();
  const sourceRunSessions: SourceRunSession[] = [];

  for (const run of sourceRuns) {
    const runSession = run.sessions.find((s) => s.sessionId === sessionId);
    if (!runSession || runSession.status !== "DONE") {
      console.log(
        `[buildAdjudicationPrompt] Skipping run ${run.name} — session not DONE`,
      );
      continue;
    }

    const session = await SessionService.findById(runSession.sessionId);
    if (!session) continue;

    const sourcePath = `storage/${projectId}/runs/${run._id}/${sessionId}/${session.name}`;
    const downloadedPath = await storage.download({ sourcePath });
    const sessionJSON = await fse.readJSON(downloadedPath);

    sourceRunSessions.push({
      runId: run._id,
      runName: run.name,
      sessionJSON,
    });
  }

  console.log(
    "[buildAdjudicationPrompt] Loaded session files from",
    sourceRunSessions.length,
    "source runs",
  );

  const firstSourceRunSessionFile = sourceRunSessions[0]?.sessionJSON || null;

  if (annotationType === "PER_UTTERANCE") {
    return buildPerUtteranceResult(originalJSON, sourceRunSessions, fieldKeys);
  }

  return buildPerSessionResult(
    sourceRunSessions,
    fieldKeys,
    firstSourceRunSessionFile,
  );
}

function buildPerUtteranceResult(
  originalJSON: any,
  sourceRunSessions: SourceRunSession[],
  fieldKeys: string[],
): BuildAdjudicationPromptResult {
  const transcript = originalJSON.transcript || [];
  const disagreementLines: string[] = [];
  const agreedAnnotations = new Map<string, any>();
  let hasDisagreements = false;
  const firstSourceRunSessionFile = sourceRunSessions[0]?.sessionJSON || null;

  for (let i = 0; i < transcript.length; i++) {
    const utterance = transcript[i];
    let utteranceHasDisagreement = false;

    for (const fieldKey of fieldKeys) {
      const values = sourceRunSessions.map((srs) => {
        const srcUtterance = srs.sessionJSON?.transcript?.[i];
        const annotations = srcUtterance?.annotations || [];
        const match = annotations.find(
          (a: any) => a[fieldKey] !== undefined && a[fieldKey] !== null,
        );
        return match ? String(match[fieldKey]) : "";
      });

      const uniqueValues = new Set(values.filter((v) => v !== ""));
      if (uniqueValues.size > 1) {
        utteranceHasDisagreement = true;
        break;
      }
    }

    if (utteranceHasDisagreement) {
      hasDisagreements = true;

      const lines: string[] = [
        `Utterance ${utterance._id}: "${utterance.content}"`,
      ];

      for (const srs of sourceRunSessions) {
        const srcUtterance = srs.sessionJSON?.transcript?.[i];
        const annotations = srcUtterance?.annotations || [];
        const lastAnnotation = annotations[annotations.length - 1];
        if (lastAnnotation) {
          lines.push(`- ${srs.runName}: ${JSON.stringify(lastAnnotation)}`);
        }
      }

      disagreementLines.push(lines.join("\n"));

      console.log(
        `[buildAdjudicationPrompt] Disagreement at utterance ${utterance._id}:`,
        sourceRunSessions.map((srs) => {
          const srcUtterance = srs.sessionJSON?.transcript?.[i];
          const annotations = srcUtterance?.annotations || [];
          return {
            run: srs.runName,
            annotation: annotations[annotations.length - 1],
          };
        }),
      );
    } else {
      // All runs agreed — store the first source run's annotation
      const firstSrcUtterance = firstSourceRunSessionFile?.transcript?.[i];
      const annotations = firstSrcUtterance?.annotations || [];
      const lastAnnotation = annotations[annotations.length - 1];
      if (lastAnnotation) {
        agreedAnnotations.set(utterance._id, lastAnnotation);
      }
    }
  }

  const adjudicationContext = hasDisagreements
    ? `The following utterances have conflicting annotations from multiple models. Review each and determine the correct label.\n\n${disagreementLines.join("\n\n")}`
    : "";

  console.log("[buildAdjudicationPrompt] PER_UTTERANCE result:", {
    hasDisagreements,
    disagreementCount: disagreementLines.length,
    agreedCount: agreedAnnotations.size,
  });

  return {
    hasDisagreements,
    adjudicationContext,
    firstSourceRunSessionFile,
    agreedAnnotations,
  };
}

function buildPerSessionResult(
  sourceRunSessions: SourceRunSession[],
  fieldKeys: string[],
  firstSourceRunSessionFile: any,
): BuildAdjudicationPromptResult {
  let hasDisagreements = false;
  const agreedAnnotations = new Map<string, any>();

  for (const fieldKey of fieldKeys) {
    const values = sourceRunSessions.map((srs) => {
      const annotations = srs.sessionJSON?.annotations || [];
      const match = annotations.find(
        (a: any) => a[fieldKey] !== undefined && a[fieldKey] !== null,
      );
      return match ? String(match[fieldKey]) : "";
    });

    const uniqueValues = new Set(values.filter((v) => v !== ""));
    if (uniqueValues.size > 1) {
      hasDisagreements = true;
      break;
    }
  }

  let adjudicationContext = "";

  if (hasDisagreements) {
    const lines: string[] = [
      "The following session has conflicting annotations from multiple models. Review and determine the correct label.",
      "",
    ];

    for (const srs of sourceRunSessions) {
      const annotations = srs.sessionJSON?.annotations || [];
      const lastAnnotation = annotations[annotations.length - 1];
      if (lastAnnotation) {
        lines.push(`- ${srs.runName}: ${JSON.stringify(lastAnnotation)}`);
      }
    }

    adjudicationContext = lines.join("\n");

    console.log(
      "[buildAdjudicationPrompt] PER_SESSION disagreement:",
      sourceRunSessions.map((srs) => {
        const annotations = srs.sessionJSON?.annotations || [];
        return {
          run: srs.runName,
          annotation: annotations[annotations.length - 1],
        };
      }),
    );
  } else {
    // All runs agreed — store the first source run's session annotation
    const annotations = firstSourceRunSessionFile?.annotations || [];
    const lastAnnotation = annotations[annotations.length - 1];
    if (lastAnnotation) {
      agreedAnnotations.set("session", lastAnnotation);
    }
  }

  console.log("[buildAdjudicationPrompt] PER_SESSION result:", {
    hasDisagreements,
    agreedCount: agreedAnnotations.size,
  });

  return {
    hasDisagreements,
    adjudicationContext,
    firstSourceRunSessionFile,
    agreedAnnotations,
  };
}
