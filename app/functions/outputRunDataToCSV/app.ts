import fse from "fs-extra";
import { json2csv } from "json-2-csv";
import map from "lodash/map.js";
import { getRunModelCode } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";

function getAnnotatorName(run: Run): string {
  return run.isHuman && run.annotator?.name ? run.annotator.name : "AI-0";
}

function getExportFieldKeys(run: Run): string[] {
  const schema = run.snapshot?.prompt?.annotationSchema;
  if (!schema) return [];
  return schema
    .filter((field: any) => !field.isSystem || field.fieldKey === "reasoning")
    .map((field: any) => field.fieldKey);
}

export const handler = async (event: {
  body: { run: Run; inputFolder: string; outputFolder: string };
}) => {
  try {
    const { body } = event;
    const { run, inputFolder, outputFolder } = body;

    const utterancesOutputFile = `${outputFolder}/${run.project}-${run._id}-utterances.csv`;
    const sessionsOutputFile = `${outputFolder}/${run.project}-${run._id}-sessions.csv`;
    const metaOutputFile = `${outputFolder}/${run.project}-${run._id}-meta.csv`;

    const utteranceKeys = [
      "_id",
      "session_id",
      "sequence_id",
      "role",
      "content",
      "start_time",
      "end_time",
    ];
    const annotationColumnKeys = new Set<string>();
    let utterancesArray: any[] = [];
    const sessionsArray: any[] = [];

    const storage = getStorageAdapter();

    const annotatorName = getAnnotatorName(run);
    const fieldKeys = getExportFieldKeys(run);

    for (const session of run.sessions) {
      const sessionPath = `${inputFolder}/${session.sessionId}/${session.name}`;

      const downloadedPath = await storage.download({
        sourcePath: sessionPath,
      });
      const json = await fse.readJSON(downloadedPath);

      const transcript = map(json.transcript, (utterance) => {
        const { annotations, ...rest } = utterance;

        const row: any = { ...rest, sessionId: session.sessionId };

        if (annotations) {
          annotations.forEach((annotation: any, index: number) => {
            for (const fieldKey of fieldKeys) {
              const columnKey = `annotator[${annotatorName}][${index}]${fieldKey}`;
              row[columnKey] = annotation[fieldKey] ?? "";
              annotationColumnKeys.add(columnKey);
            }
          });
        }

        return row;
      });

      utterancesArray = utterancesArray.concat(transcript);

      const sessionObject: any = {
        _id: session.sessionId,
      };

      if (json.annotations) {
        json.annotations.forEach((annotation: any, index: number) => {
          for (const fieldKey of fieldKeys) {
            const columnKey = `annotator[${annotatorName}][${index}]${fieldKey}`;
            sessionObject[columnKey] = annotation[fieldKey] ?? "";
            annotationColumnKeys.add(columnKey);
          }
        });
      }

      sessionsArray.push(sessionObject);
    }

    // OUTPUT UTTERANCES
    if (run.annotationType === "PER_UTTERANCE") {
      const utterancesCsv = json2csv(utterancesArray, {
        keys: [...utteranceKeys, ...annotationColumnKeys],
        emptyFieldValue: "",
      });

      await fse.outputFile(`tmp/${utterancesOutputFile}`, utterancesCsv);
      const utterancesBuffer = await fse.readFile(
        `tmp/${utterancesOutputFile}`,
      );
      await storage.upload({
        file: {
          buffer: utterancesBuffer,
          size: utterancesBuffer.length,
          type: "text/csv",
        },
        uploadPath: utterancesOutputFile,
      });
    }

    // OUTPUT SESSIONS
    if (run.annotationType === "PER_SESSION") {
      const sessionsCsv = json2csv(sessionsArray, {
        keys: ["_id", ...annotationColumnKeys],
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

    // OUTPUT META
    const metaObject: any = {
      project: run.project,
      _id: run._id,
      name: run.name,
      annotator: annotatorName,
      annotationType: run.annotationType,
      model: getRunModelCode(run),
      sessionsCount: run.sessions.length,
    };

    if (run.snapshot?.prompt) {
      metaObject.promptName = run.snapshot.prompt.name;
      metaObject.promptUserPrompt = run.snapshot.prompt.userPrompt;
      metaObject.promptAnnotationType = run.snapshot.prompt.annotationType;
      metaObject.promptVersion = run.snapshot.prompt.version;
    } else {
      metaObject.prompt = run.prompt;
      metaObject.promptVersion = run.promptVersion;
    }

    const metaCsv = json2csv([metaObject], {
      keys: Object.keys(metaObject),
      emptyFieldValue: "",
    });

    await fse.outputFile(`tmp/${metaOutputFile}`, metaCsv);
    const metaBuffer = await fse.readFile(`tmp/${metaOutputFile}`);
    await storage.upload({
      file: {
        buffer: metaBuffer,
        size: metaBuffer.length,
        type: "text/csv",
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
