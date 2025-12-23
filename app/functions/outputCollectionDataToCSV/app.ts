import fse from 'fs-extra'
import { json2csv } from 'json-2-csv'
import each from 'lodash/each.js'
import map from 'lodash/map.js'
import type { Collection } from '~/modules/collections/collections.types'
import { getRunModelCode } from '~/modules/runs/helpers/runModel'
import type { Run } from '~/modules/runs/runs.types'

export const handler = async (event: { body: { collection: Collection, runs: Run[], inputFolder: string, outputFolder: string } }) => {

  const { body } = event;
  const { collection, runs, inputFolder, outputFolder } = body;

  const utterancesOutputFile = `${outputFolder}/${collection.project}-${collection._id}-utterances.csv`;
  const sessionsOutputFile = `${outputFolder}/${collection.project}-${collection._id}-sessions.csv`;
  const metaOutputFile = `${outputFolder}/${collection.project}-${collection._id}-meta.csv`;

  await fse.ensureDir(`${outputFolder}`);

  let utteranceKeys = ['_id', 'sessionId', 'role', 'start_time', 'end_time', 'content'];
  let utteranceAnnotationKeysAsObject: { [key: string]: boolean } = {};
  let sessionAnnotationKeysAsObject: { [key: string]: boolean } = {};
  let utterancesArray: any[] = [];
  let sessionsArray = [];
  let metaArray = [];
  let isBaseRun = true;
  let currentUtteranceArray = 0;
  // Map all utterances across runs first
  for (const run of runs) {
    console.log(run);
    if (isBaseRun) {

      for (const session of run.sessions) {
        const json = await fse.readJSON(`${inputFolder}/${run._id}/${session.sessionId}/${session.name}`);

        const transcript = map(json.transcript, (utterance) => {
          utterance.sessionId = session.sessionId;
          delete utterance.annotations;
          return utterance;
        });
        utterancesArray = utterancesArray.concat(transcript);
      }

      isBaseRun = false;
    }

    for (const session of run.sessions) {
      const json = await fse.readJSON(`${inputFolder}/${run._id}/${session.sessionId}/${session.name}`);

      for (const utterance of json.transcript) {
        if (utterance.annotations) {
          each(utterance.annotations, (annotation, index) => {
            each(annotation, (annotationValue, annotationKey) => {
              if (annotationKey === '_id') return;
              let annotationItemKey = `${annotationKey}-${index}`;
              utterance[annotationItemKey] = annotationValue;
              if (!utteranceAnnotationKeysAsObject[annotationItemKey]) {
                utteranceAnnotationKeysAsObject[annotationItemKey] = true;
              }
              utterance[`model-${index}`] = getRunModelCode(run)
              utterance[`annotationType-${index}`] = run.annotationType;
              utterance[`prompt-${index}`] = run.prompt;
              utterance[`promptVersion-${index}`] = run.promptVersion;
            })
          });
        }
      }

    }
  }

  const utterancesCsv = json2csv(utterancesArray, {
    keys: [...utteranceKeys, ...Object.keys(utteranceAnnotationKeysAsObject)],
    emptyFieldValue: ''
  });

  await fse.outputFile(utterancesOutputFile, utterancesCsv);

  // for (const session of run.sessions) {

  //   const json = await fse.readJSON(`${inputFolder}/${session.sessionId}/${session.name}`);

  //   const transcript = map(json.transcript, (utterance) => {
  //     utterance.sessionId = session.sessionId;
  //     if (utterance.annotations) {
  //       each(utterance.annotations, (annotation, index) => {
  //         each(annotation, (annotationValue, annotationKey) => {
  //           if (annotationKey === '_id') return;
  //           let annotationItemKey = `${annotationKey}-${index}`;
  //           utterance[annotationItemKey] = annotationValue;
  //           if (!utteranceAnnotationKeysAsObject[annotationItemKey]) {
  //             utteranceAnnotationKeysAsObject[annotationItemKey] = true;
  //           }
  //         })
  //       });
  //     }
  //     delete utterance.annotations;
  //     return utterance;
  //   });

  //   utterancesArray = utterancesArray.concat(transcript);

  //   let sessionObject: { _id: any;[key: string]: any } = {
  //     _id: session.sessionId,
  //   };

  //   if (json.annotations) {
  //     each(json.annotations, (annotation, index) => {
  //       each(annotation, (annotationValue, annotationKey) => {
  //         if (annotationKey === '_id') return;
  //         let annotationItemKey = `${annotationKey}-${index}`;
  //         sessionObject[annotationItemKey] = annotationValue;
  //         if (!sessionAnnotationKeysAsObject[annotationItemKey]) {
  //           sessionAnnotationKeysAsObject[annotationItemKey] = true;
  //         }
  //       })
  //     });
  //   }

  //   sessionsArray.push(sessionObject);

  // }

  // // OUTPUT UTTERANCES
  // if (run.annotationType === 'PER_UTTERANCE') {
  //   const utterancesCsv = json2csv(utterancesArray, {
  //     keys: [...utteranceKeys, ...Object.keys(utteranceAnnotationKeysAsObject)],
  //     emptyFieldValue: ''
  //   });

  //   await fse.outputFile(utterancesOutputFile, utterancesCsv);
  // }

  // // OUTPUT SESSIONS
  // if (run.annotationType === 'PER_SESSION') {
  //   const sessionsCsv = json2csv(sessionsArray, {
  //     keys: Object.keys(sessionAnnotationKeysAsObject),
  //     emptyFieldValue: ''
  //   });
  //   await fse.outputFile(sessionsOutputFile, sessionsCsv);
  // }

  // // OUTPUT META
  // let runObject = pick(run, ['project', '_id', 'name', 'annotationType', 'prompt', 'promptVersion', 'model']);

  // // @ts-ignore
  // runObject.sessionsCount = run.sessions.length;

  // metaArray.push(runObject);

  // const metaKeys = Object.keys(runObject);

  // const metaCsv = json2csv(metaArray, {
  //   keys: metaKeys,
  //   emptyFieldValue: ''
  // });

  // await fse.outputFile(metaOutputFile, metaCsv);

};
