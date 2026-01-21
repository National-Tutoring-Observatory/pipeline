import fse from "fs-extra";
import { json2csv } from "json-2-csv";
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

  const utterancesOutputFile = `${outputFolder}/${collection.project}-${collection._id}-utterances.csv`;
  const sessionsOutputFile = `${outputFolder}/${collection.project}-${collection._id}-sessions.csv`;
  const metaOutputFile = `${outputFolder}/${collection.project}-${collection._id}-meta.csv`;

  const storage = getStorageAdapter();

  // Determine annotation type from first run (all runs in collection share same type)
  const annotationType = runs[0]?.annotationType;

  let utteranceKeys = [
    "_id",
    "sessionId",
    "role",
    "start_time",
    "end_time",
    "content",
  ];
  let utteranceAnnotationKeysAsObject: { [key: string]: boolean } = {};
  let sessionAnnotationKeysAsObject: { [key: string]: boolean } = {};
  let utterancesArray: any[] = [];
  let sessionsArray: any[] = [];
  let isBaseRun = true;
  let annotationIndex = 0;

  // First pass: Build base arrays from first run
  for (const run of runs) {
    if (isBaseRun) {
      for (const session of run.sessions) {
        const sessionPath = `${inputFolder}/${run._id}/${session.sessionId}/${session.name}`;
        const downloadedPath = await storage.download({
          sourcePath: sessionPath,
        });
        const json = await fse.readJSON(downloadedPath);

        // Build utterances array
        const transcript = map(json.transcript, (utterance) => {
          utterance.sessionId = session.sessionId;
          delete utterance.annotations;
          return utterance;
        });
        utterancesArray = utterancesArray.concat(transcript);

        // Build sessions array
        sessionsArray.push({
          _id: session.sessionId,
        });
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

      // Merge utterance-level annotations
      if (annotationType === "PER_UTTERANCE") {
        for (const utterance of json.transcript) {
          if (utterance.annotations && utterance.annotations.length > 0) {
            // Find matching utterance in base array by _id and sessionId
            const baseUtterance = utterancesArray.find(
              (u) =>
                u._id === utterance._id && u.sessionId === session.sessionId,
            );

            if (baseUtterance) {
              each(utterance.annotations, (annotation) => {
                each(annotation, (annotationValue, annotationKey) => {
                  if (annotationKey === "_id") return;

                  let annotationItemKey = `${annotationKey}-${annotationIndex}`;
                  baseUtterance[annotationItemKey] = annotationValue;

                  if (!utteranceAnnotationKeysAsObject[annotationItemKey]) {
                    utteranceAnnotationKeysAsObject[annotationItemKey] = true;
                  }
                });

                // Add metadata for this annotation
                baseUtterance[`model-${annotationIndex}`] =
                  getRunModelCode(run);
                baseUtterance[`annotationType-${annotationIndex}`] =
                  run.annotationType;
                baseUtterance[`prompt-${annotationIndex}`] = run.prompt;
                baseUtterance[`promptVersion-${annotationIndex}`] =
                  run.promptVersion;
              });
            }
          }
        }
      }

      // Merge session-level annotations
      if (annotationType === "PER_SESSION") {
        if (json.annotations && json.annotations.length > 0) {
          // Find matching session in base array
          const baseSession = sessionsArray.find(
            (s) => s._id === session.sessionId,
          );

          if (baseSession) {
            each(json.annotations, (annotation) => {
              each(annotation, (annotationValue, annotationKey) => {
                if (annotationKey === "_id") return;

                let annotationItemKey = `${annotationKey}-${annotationIndex}`;
                baseSession[annotationItemKey] = annotationValue;

                if (!sessionAnnotationKeysAsObject[annotationItemKey]) {
                  sessionAnnotationKeysAsObject[annotationItemKey] = true;
                }
              });

              // Add metadata for this annotation
              baseSession[`model-${annotationIndex}`] = getRunModelCode(run);
              baseSession[`annotationType-${annotationIndex}`] =
                run.annotationType;
              baseSession[`prompt-${annotationIndex}`] = run.prompt;
              baseSession[`promptVersion-${annotationIndex}`] =
                run.promptVersion;
            });
          }
        }
      }
    }
    annotationIndex++;
  }

  // Build metadata keys for all annotation indices
  const metadataKeys: string[] = [];
  for (let i = 0; i < runs.length; i++) {
    metadataKeys.push(
      `model-${i}`,
      `annotationType-${i}`,
      `prompt-${i}`,
      `promptVersion-${i}`,
    );
  }

  // Export utterances CSV for PER_UTTERANCE
  if (annotationType === "PER_UTTERANCE") {
    const utterancesCsv = json2csv(utterancesArray, {
      keys: [
        ...utteranceKeys,
        ...Object.keys(utteranceAnnotationKeysAsObject),
        ...metadataKeys,
      ],
      emptyFieldValue: "",
    });

    await fse.outputFile(`tmp/${utterancesOutputFile}`, utterancesCsv);
    const utterancesBuffer = await fse.readFile(`tmp/${utterancesOutputFile}`);
    await storage.upload({
      file: {
        buffer: utterancesBuffer,
        size: utterancesBuffer.length,
        type: "text/csv",
      },
      uploadPath: utterancesOutputFile,
    });
  }

  // Export sessions CSV for PER_SESSION
  if (annotationType === "PER_SESSION") {
    const sessionsCsv = json2csv(sessionsArray, {
      keys: [
        "_id",
        ...Object.keys(sessionAnnotationKeysAsObject),
        ...metadataKeys,
      ],
      emptyFieldValue: "",
    });

    await fse.outputFile(`tmp/${sessionsOutputFile}`, sessionsCsv);
    const sessionsBuffer = await fse.readFile(`tmp/${sessionsOutputFile}`);
    await storage.upload({
      file: {
        buffer: sessionsBuffer,
        size: sessionsBuffer.length,
        type: "text/csv",
      },
      uploadPath: sessionsOutputFile,
    });
  }

  // Export meta CSV
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

  const metaCsv = json2csv(metaArray, {
    keys: [
      "project",
      "runId",
      "runName",
      "annotationType",
      "model",
      "prompt",
      "promptVersion",
      "sessionsCount",
    ],
    emptyFieldValue: "",
  });

  await fse.outputFile(`tmp/${metaOutputFile}`, metaCsv);
  const metaBuffer = await fse.readFile(`tmp/${metaOutputFile}`);
  await storage.upload({
    file: { buffer: metaBuffer, size: metaBuffer.length, type: "text/csv" },
    uploadPath: metaOutputFile,
  });
};
