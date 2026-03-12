import fse from "fs-extra";
import each from "lodash/each.js";
import map from "lodash/map.js";
import type { RunSet } from "~/modules/runSets/runSets.types";
import getAnnotatorName from "~/modules/runs/helpers/getAnnotatorName";
import { getRunModelCode } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

export const handler = async (event: {
  body: {
    runSet: RunSet;
    runs: Run[];
    teamId: string;
    inputFolder: string;
    outputFolder: string;
  };
}) => {
  const { body } = event;
  const { runSet, runs, teamId, inputFolder, outputFolder } = body;

  const sessionsOutputFile = `${outputFolder}/${runSet.project}-${runSet._id}-sessions.jsonl`;
  const metaOutputFile = `${outputFolder}/${runSet.project}-${runSet._id}-meta.jsonl`;

  const storage = getStorageAdapter();

  const { annotationType } = runSet;

  const sessionsArray: any[] = [];
  let isBaseRun = true;

  for (const run of runs) {
    for (const session of run.sessions) {
      const sessionPath = `${inputFolder}/${run._id}/${session.sessionId}/${session.name}`;
      const downloadedPath = await storage.download({
        sourcePath: sessionPath,
      });
      const json = await fse.readJSON(downloadedPath);

      if (isBaseRun) {
        const sessionObject: any = {
          _id: session.sessionId,
          transcript: map(json.transcript, (utterance) => {
            const { annotations: _annotations, ...cleanUtterance } = utterance;
            return cleanUtterance;
          }),
        };

        if (json.metadata) {
          sessionObject.metadata = json.metadata;
        }

        sessionsArray.push(sessionObject);
      }

      const baseSession = sessionsArray.find(
        (s) => s._id === session.sessionId,
      );

      if (!baseSession) continue;

      if (!baseSession.annotations) {
        baseSession.annotations = [];
      }

      if (annotationType === "PER_UTTERANCE") {
        for (let i = 0; i < json.transcript.length; i++) {
          const utterance = json.transcript[i];
          const baseUtterance = baseSession.transcript[i];

          if (
            utterance.annotations &&
            utterance.annotations.length > 0 &&
            baseUtterance
          ) {
            if (!baseUtterance.annotations) {
              baseUtterance.annotations = [];
            }

            each(utterance.annotations, (annotation) => {
              baseUtterance.annotations.push({
                ...annotation,
                _metadata: {
                  runId: run._id,
                  runName: run.name,
                  model: getRunModelCode(run),
                  annotationType: run.annotationType,
                  prompt: run.prompt,
                  promptVersion: run.promptVersion,
                },
              });
            });
          }
        }
      }

      if (annotationType === "PER_SESSION") {
        if (json.annotations && json.annotations.length > 0) {
          each(json.annotations, (annotation) => {
            baseSession.annotations.push({
              ...annotation,
              _metadata: {
                runId: run._id,
                runName: run.name,
                model: getRunModelCode(run),
                annotationType: run.annotationType,
                prompt: run.prompt,
                promptVersion: run.promptVersion,
              },
            });
          });
        }
      }
    }

    if (isBaseRun) isBaseRun = false;
  }

  // Output sessions JSONL
  const sessionsAsJSONL = map(sessionsArray, (session) => {
    return JSON.stringify(session);
  }).join("\n");

  await fse.ensureDir(`tmp/${outputFolder}`);
  await fse.outputFile(`tmp/${sessionsOutputFile}`, sessionsAsJSONL);

  const sessionsBuffer = await fse.readFile(`tmp/${sessionsOutputFile}`);

  await storage.upload({
    file: {
      buffer: sessionsBuffer,
      size: sessionsBuffer.length,
      type: "application/x-ndjson",
    },
    uploadPath: sessionsOutputFile,
  });

  // Output meta JSONL
  const metaArray = runs.map((run, index) => ({
    teamId,
    projectId: run.project,
    runId: run._id,
    runName: run.name,
    annotator: getAnnotatorName(run, index),
    annotationType: run.annotationType,
    model: getRunModelCode(run),
    promptName: run.snapshot?.prompt?.name ?? "",
    promptVersion: run.snapshot?.prompt?.version ?? run.promptVersion ?? "",
    promptUserPrompt: run.snapshot?.prompt?.userPrompt ?? "",
    promptAnnotationType: run.snapshot?.prompt?.annotationType ?? "",
    isHuman: run.isHuman ?? false,
    sessionsCount: run.sessions.length,
    createdAt: run.createdAt ?? "",
    startedAt: run.startedAt ?? "",
    finishedAt: run.finishedAt ?? "",
  }));

  const metaAsJSONL = map(metaArray, (meta) => {
    return JSON.stringify(meta);
  }).join("\n");

  await fse.outputFile(`tmp/${metaOutputFile}`, metaAsJSONL);

  const metaBuffer = await fse.readFile(`tmp/${metaOutputFile}`);

  await storage.upload({
    file: {
      buffer: metaBuffer,
      size: metaBuffer.length,
      type: "application/x-ndjson",
    },
    uploadPath: metaOutputFile,
  });

  return {
    statusCode: 200,
  };
};
