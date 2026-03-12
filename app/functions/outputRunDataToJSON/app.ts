import fse from "fs-extra";
import map from "lodash/map.js";
import getAnnotatorName from "~/modules/runs/helpers/getAnnotatorName";
import { getRunModelInfo } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

export const handler = async (event: {
  body: { run: Run; inputFolder: string; outputFolder: string };
}) => {
  try {
    const { body } = event;
    const { run, inputFolder, outputFolder } = body;

    const sessionsOutputFile = `${outputFolder}/${run.project}-${run._id}-sessions.jsonl`;
    const metaOutputFile = `${outputFolder}/${run.project}-${run._id}-meta.jsonl`;

    const sessionsArray = [];
    const metaArray = [];

    const storage = getStorageAdapter();

    for (const session of run.sessions) {
      const sessionPath = `${inputFolder}/${session.sessionId}/${session.name}`;

      const downloadedPath = await storage.download({
        sourcePath: sessionPath,
      });
      const json = await fse.readJSON(downloadedPath);

      sessionsArray.push(json);
    }

    const sessionsAsJSONL = map(sessionsArray, (session) => {
      return JSON.stringify(session);
    }).join("\n");

    await fse.outputFile(`tmp/${sessionsOutputFile}`, sessionsAsJSONL);

    const sessionsBuffer = await fse.readFile(`tmp/${sessionsOutputFile}`);

    await storage.upload({
      file: {
        buffer: sessionsBuffer,
        size: sessionsBuffer.length,
        type: "application/json",
      },
      uploadPath: sessionsOutputFile,
    });

    // OUTPUT META
    const runObject: any = {
      project: run.project,
      _id: run._id,
      name: run.name,
      annotator: getAnnotatorName(run),
      annotationType: run.annotationType,
      model: getRunModelInfo(run),
      promptName: run.snapshot?.prompt?.name ?? "",
      promptVersion: run.snapshot?.prompt?.version ?? run.promptVersion ?? "",
      promptUserPrompt: run.snapshot?.prompt?.userPrompt ?? "",
      promptAnnotationType: run.snapshot?.prompt?.annotationType ?? "",
      isHuman: run.isHuman ?? false,
      sessionsCount: run.sessions.length,
      createdAt: run.createdAt ?? "",
      startedAt: run.startedAt ?? "",
      finishedAt: run.finishedAt ?? "",
    };

    metaArray.push(runObject);

    const metaAsJSONL = map(metaArray, (meta) => {
      return JSON.stringify(meta);
    }).join("\n");

    await fse.outputFile(`tmp/${metaOutputFile}`, metaAsJSONL);

    const metaBuffer = await fse.readFile(`tmp/${metaOutputFile}`);

    await storage.upload({
      file: {
        buffer: metaBuffer,
        size: metaBuffer.length,
        type: "application/json",
      },
      uploadPath: metaOutputFile,
    });

    return {
      statusCode: 200,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err,
      }),
    };
  }
};
