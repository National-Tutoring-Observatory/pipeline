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
    "sessionId",
    "role",
    "start_time",
    "end_time",
    "content",
  ];
  const utteranceAnnotationKeysAsObject: { [key: string]: boolean } = {};
  const sessionAnnotationKeysAsObject: { [key: string]: boolean } = {};
  let utterancesArray: any[] = [];
  const sessionsArray: any[] = [];
  let isBaseRun = true;
  let annotationIndex = 0;

  const runSuffixes: string[] = [];

  for (const run of runs) {
    const runSuffix =
      run.isHuman && run.annotator?.name
        ? run.annotator.name
        : String(annotationIndex);
    runSuffixes.push(runSuffix);

    for (const session of run.sessions) {
      const sessionPath = `${inputFolder}/${run._id}/${session.sessionId}/${session.name}`;
      const downloadedPath = await storage.download({
        sourcePath: sessionPath,
      });
      const json = await fse.readJSON(downloadedPath);

      if (isBaseRun) {
        const transcript = map(json.transcript, (utterance) => {
          const { annotations: _annotations, ...rest } = utterance;
          return { ...rest, sessionId: session.sessionId };
        });
        utterancesArray = utterancesArray.concat(transcript);

        sessionsArray.push({
          _id: session.sessionId,
        });
      }

      if (annotationType === "PER_UTTERANCE") {
        for (const utterance of json.transcript) {
          if (utterance.annotations && utterance.annotations.length > 0) {
            const baseUtterance = utterancesArray.find(
              (u) =>
                u._id === utterance._id && u.sessionId === session.sessionId,
            );

            if (baseUtterance) {
              each(utterance.annotations, (annotation) => {
                each(annotation, (annotationValue, annotationKey) => {
                  if (annotationKey === "_id") return;

                  const annotationItemKey = `${annotationKey}-${runSuffix}`;
                  baseUtterance[annotationItemKey] = annotationValue;

                  if (!utteranceAnnotationKeysAsObject[annotationItemKey]) {
                    utteranceAnnotationKeysAsObject[annotationItemKey] = true;
                  }
                });

                baseUtterance[`model-${runSuffix}`] = getRunModelCode(run);
                baseUtterance[`annotationType-${runSuffix}`] =
                  run.annotationType;
                baseUtterance[`prompt-${runSuffix}`] = run.prompt;
                baseUtterance[`promptVersion-${runSuffix}`] = run.promptVersion;
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

                const annotationItemKey = `${annotationKey}-${runSuffix}`;
                baseSession[annotationItemKey] = annotationValue;

                if (!sessionAnnotationKeysAsObject[annotationItemKey]) {
                  sessionAnnotationKeysAsObject[annotationItemKey] = true;
                }
              });

              baseSession[`model-${runSuffix}`] = getRunModelCode(run);
              baseSession[`annotationType-${runSuffix}`] = run.annotationType;
              baseSession[`prompt-${runSuffix}`] = run.prompt;
              baseSession[`promptVersion-${runSuffix}`] = run.promptVersion;
            });
          }
        }
      }
    }

    if (isBaseRun) isBaseRun = false;
    annotationIndex++;
  }

  // Build metadata keys for all runs
  const metadataKeys: string[] = [];
  for (const suffix of runSuffixes) {
    metadataKeys.push(
      `model-${suffix}`,
      `annotationType-${suffix}`,
      `prompt-${suffix}`,
      `promptVersion-${suffix}`,
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
