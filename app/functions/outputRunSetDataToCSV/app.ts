import fse from "fs-extra";
import { json2csv } from "json-2-csv";
import each from "lodash/each.js";
import map from "lodash/map.js";
import type { RunSet } from "~/modules/runSets/runSets.types";
import { getRunModelCode } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

export const handler = async (event: {
  body: {
    runSet: RunSet;
    runs: Run[];
    inputFolder: string;
    outputFolder: string;
  };
}) => {
  const { body } = event;
  const { runSet, runs, inputFolder, outputFolder } = body;

  const utterancesOutputFile = `${outputFolder}/${runSet.project}-${runSet._id}-utterances.csv`;
  const sessionsOutputFile = `${outputFolder}/${runSet.project}-${runSet._id}-sessions.csv`;
  const metaOutputFile = `${outputFolder}/${runSet.project}-${runSet._id}-meta.csv`;

  const storage = getStorageAdapter();

  const { annotationType } = runSet;

  const utteranceKeys = [
    "_id",
    "session_id",
    "sequence_id",
    "role",
    "content",
    "start_time",
    "end_time",
  ];
  const utteranceAnnotationKeysAsObject: { [key: string]: boolean } = {};
  const sessionAnnotationKeysAsObject: { [key: string]: boolean } = {};
  let utterancesArray: any[] = [];
  const sessionsArray: any[] = [];
  let isBaseRun = true;
  let annotationIndex = 0;

  for (const run of runs) {
    for (const session of run.sessions) {
      const sessionPath = `${inputFolder}/${run._id}/${session.sessionId}/${session.name}`;
      const downloadedPath = await storage.download({
        sourcePath: sessionPath,
      });
      const json = await fse.readJSON(downloadedPath);

      if (isBaseRun) {
        const transcript = map(json.transcript, (utterance) => {
          utterance._sessionRef = session.sessionId;
          delete utterance.annotations;
          return utterance;
        });
        utterancesArray = utterancesArray.concat(transcript);

        sessionsArray.push({
          _id: session.sessionId,
          session_id: json.transcript[0]?.session_id,
        });
      }

      if (annotationType === "PER_UTTERANCE") {
        for (const utterance of json.transcript) {
          if (utterance.annotations && utterance.annotations.length > 0) {
            const baseUtterance = utterancesArray.find(
              (u) =>
                u._id === utterance._id && u._sessionRef === session.sessionId,
            );

            if (baseUtterance) {
              each(utterance.annotations, (annotation) => {
                each(annotation, (annotationValue, annotationKey) => {
                  if (annotationKey === "_id") return;

                  const annotationItemKey = `${annotationKey}-${annotationIndex}`;
                  baseUtterance[annotationItemKey] = annotationValue;

                  if (!utteranceAnnotationKeysAsObject[annotationItemKey]) {
                    utteranceAnnotationKeysAsObject[annotationItemKey] = true;
                  }
                });

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

      if (annotationType === "PER_SESSION") {
        if (json.annotations && json.annotations.length > 0) {
          const baseSession = sessionsArray.find(
            (s) => s._id === session.sessionId,
          );

          if (baseSession) {
            each(json.annotations, (annotation) => {
              each(annotation, (annotationValue, annotationKey) => {
                if (annotationKey === "_id") return;

                const annotationItemKey = `${annotationKey}-${annotationIndex}`;
                baseSession[annotationItemKey] = annotationValue;

                if (!sessionAnnotationKeysAsObject[annotationItemKey]) {
                  sessionAnnotationKeysAsObject[annotationItemKey] = true;
                }
              });

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

    if (isBaseRun) isBaseRun = false;
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
        "session_id",
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
