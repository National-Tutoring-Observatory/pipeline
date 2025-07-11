import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import { json2csv } from 'json-2-csv';
import map from 'lodash/map.js';
import each from 'lodash/each.js';
import pick from 'lodash/pick.js';
import type { Run } from '~/modules/runs/runs.types';

export const handler = async (event: { body: { run: Run, inputFolder: string, outputFolder: string } }) => {
  try {
    const { body } = event;
    const { run, inputFolder, outputFolder } = body;

    const sessionsOutputFile = `${outputFolder}/${run.project}-${run._id}-sessions.jsonl`;
    const metaOutputFile = `${outputFolder}/${run.project}-${run._id}-meta.jsonl`;

    await fse.ensureDir(`${outputFolder}`);

    let sessionsArray = [];
    let metaArray = [];

    for (const session of run.sessions) {

      const json = await fse.readJSON(`${inputFolder}/${session.sessionId}/${session.name}`);

      sessionsArray.push(json);

    }

    const sessionsAsJSONL = map(sessionsArray, (session) => {
      return JSON.stringify(session)
    }).join('\n');

    await fse.outputFile(sessionsOutputFile, sessionsAsJSONL);

    // OUTPUT META
    let runObject = pick(run, ['project', '_id', 'name', 'annotationType', 'prompt', 'promptVersion', 'model']);

    // @ts-ignore
    runObject.sessionsCount = run.sessions.length;

    metaArray.push(runObject);

    const metaAsJSONL = map(metaArray, (meta) => {
      return JSON.stringify(meta)
    }).join('\n');

    await fse.outputFile(metaOutputFile, metaAsJSONL);

    return {
      statusCode: 200,
    };

  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err
      }),
    };
  }
};