import fse from "fs-extra";
import { json2csv } from "json-2-csv";
import each from "lodash/each.js";
import map from "lodash/map.js";
import pick from "lodash/pick.js";
import type { Run } from "~/modules/runs/runs.types";

export const handler = async (event: {
  body: { run: Run; inputFolder: string; outputFolder: string };
}) => {
  try {
    const { body } = event;
    const { run, inputFolder, outputFolder } = body;

    const utterancesOutputFile = `${outputFolder}/${run.project}-${run._id}-utterances.csv`;
    const sessionsOutputFile = `${outputFolder}/${run.project}-${run._id}-sessions.csv`;
    const metaOutputFile = `${outputFolder}/${run.project}-${run._id}-meta.csv`;

    await fse.ensureDir(`${outputFolder}`);

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
    let sessionsArray = [];
    let metaArray = [];

    for (const session of run.sessions) {
      const json = await fse.readJSON(
        `${inputFolder}/${session.sessionId}/${session.name}`,
      );

      const transcript = map(json.transcript, (utterance) => {
        utterance.sessionId = session.sessionId;
        if (utterance.annotations) {
          each(utterance.annotations, (annotation, index) => {
            each(annotation, (annotationValue, annotationKey) => {
              if (annotationKey === "_id") return;
              let annotationItemKey = `${annotationKey}-${index}`;
              utterance[annotationItemKey] = annotationValue;
              if (!utteranceAnnotationKeysAsObject[annotationItemKey]) {
                utteranceAnnotationKeysAsObject[annotationItemKey] = true;
              }
            });
          });
        }
        delete utterance.annotations;
        return utterance;
      });

      utterancesArray = utterancesArray.concat(transcript);

      let sessionObject: { _id: any; [key: string]: any } = {
        _id: session.sessionId,
      };

      if (json.annotations) {
        each(json.annotations, (annotation, index) => {
          each(annotation, (annotationValue, annotationKey) => {
            if (annotationKey === "_id") return;
            let annotationItemKey = `${annotationKey}-${index}`;
            sessionObject[annotationItemKey] = annotationValue;
            if (!sessionAnnotationKeysAsObject[annotationItemKey]) {
              sessionAnnotationKeysAsObject[annotationItemKey] = true;
            }
          });
        });
      }

      sessionsArray.push(sessionObject);
    }

    // OUTPUT UTTERANCES
    if (run.annotationType === "PER_UTTERANCE") {
      const utterancesCsv = json2csv(utterancesArray, {
        keys: [
          ...utteranceKeys,
          ...Object.keys(utteranceAnnotationKeysAsObject),
        ],
        emptyFieldValue: "",
      });

      await fse.outputFile(utterancesOutputFile, utterancesCsv);
    }

    // OUTPUT SESSIONS
    if (run.annotationType === "PER_SESSION") {
      const sessionsCsv = json2csv(sessionsArray, {
        keys: Object.keys(sessionAnnotationKeysAsObject),
        emptyFieldValue: "",
      });
      await fse.outputFile(sessionsOutputFile, sessionsCsv);
    }

    // OUTPUT META
    let runObject = pick(run, [
      "project",
      "_id",
      "name",
      "annotationType",
      "prompt",
      "promptVersion",
      "model",
    ]);

    // @ts-ignore
    runObject.sessionsCount = run.sessions.length;

    metaArray.push(runObject);

    const metaKeys = Object.keys(runObject);

    const metaCsv = json2csv(metaArray, {
      keys: metaKeys,
      emptyFieldValue: "",
    });

    await fse.outputFile(metaOutputFile, metaCsv);

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
