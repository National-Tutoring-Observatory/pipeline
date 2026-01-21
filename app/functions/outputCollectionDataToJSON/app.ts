import fse from "fs-extra";
import each from "lodash/each.js";
import map from "lodash/map.js";
import type { Collection } from "~/modules/collections/collections.types";
import { getRunModelCode } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

export const handler = async (event: {
  body: {
    collection: Collection;
    runs: Run[];
    inputFolder: string;
    outputFolder: string;
  };
}) => {
  const { body } = event;
  const { collection, runs, inputFolder, outputFolder } = body;

  const sessionsOutputFile = `${outputFolder}/${collection.project}-${collection._id}-sessions.jsonl`;
  const metaOutputFile = `${outputFolder}/${collection.project}-${collection._id}-meta.jsonl`;

  const storage = getStorageAdapter();

  const { annotationType } = collection;

  let sessionsArray: any[] = [];
  let isBaseRun = true;
  let annotationIndex = 0;

  // First pass: Build base session array from first run
  for (const run of runs) {
    if (isBaseRun) {
      for (const session of run.sessions) {
        const sessionPath = `${inputFolder}/${run._id}/${session.sessionId}/${session.name}`;
        const downloadedPath = await storage.download({
          sourcePath: sessionPath,
        });
        const json = await fse.readJSON(downloadedPath);

        // Start with session ID and transcript (without annotations)
        const sessionObject: any = {
          _id: session.sessionId,
          transcript: map(json.transcript, (utterance) => {
            const cleanUtterance = { ...utterance };
            delete cleanUtterance.annotations;
            return cleanUtterance;
          }),
        };

        // Include any top-level session metadata
        if (json.metadata) {
          sessionObject.metadata = json.metadata;
        }

        sessionsArray.push(sessionObject);
      }
      isBaseRun = false;
    }
  }

  // Second pass: Merge annotations from all runs
  annotationIndex = 0;
  for (const run of runs) {
    for (const session of run.sessions) {
      const sessionPath = `${inputFolder}/${run._id}/${session.sessionId}/${session.name}`;
      const downloadedPath = await storage.download({
        sourcePath: sessionPath,
      });
      const json = await fse.readJSON(downloadedPath);

      // Find matching session in base array
      const baseSession = sessionsArray.find(
        (s) => s._id === session.sessionId,
      );

      if (!baseSession) continue;

      // Initialize annotations array if not present
      if (!baseSession.annotations) {
        baseSession.annotations = [];
      }

      // Merge utterance-level annotations
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
              // Add annotation with metadata
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

      // Merge session-level annotations
      if (annotationType === "PER_SESSION") {
        if (json.annotations && json.annotations.length > 0) {
          each(json.annotations, (annotation) => {
            // Add annotation with metadata
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
    annotationIndex++;
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
  const metaArray = runs.map((run) => ({
    project: run.project,
    runId: run._id,
    runName: run.name,
    annotationType: run.annotationType,
    model: getRunModelCode(run),
    prompt: run.prompt,
    promptVersion: run.promptVersion,
    sessionsCount: run.sessions.length,
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
