import fse from 'fs-extra';
import path from 'path';
import map from 'lodash/map.js';
import pick from 'lodash/pick.js';
import type { Run } from '~/modules/runs/runs.types';
import getStorageAdapter from '~/core/storage/helpers/getStorageAdapter';

export const handler = async (event: { body: { run: Run, inputFolder: string, outputFolder: string } }) => {
  try {
    const { body } = event;
    const { run, inputFolder, outputFolder } = body;

    const sessionsOutputFile = `${outputFolder}/${run.project}-${run._id}-sessions.jsonl`;
    const metaOutputFile = `${outputFolder}/${run.project}-${run._id}-meta.jsonl`;

    let sessionsArray = [];
    let metaArray = [];

    const storage = getStorageAdapter();

    for (const session of run.sessions) {

      const sessionPath = `${inputFolder}/${session.sessionId}/${session.name}`;

      await storage.download({ downloadPath: sessionPath });

      const json = await fse.readJSON(path.join('tmp', sessionPath));

      sessionsArray.push(json);

    }

    const sessionsAsJSONL = map(sessionsArray, (session) => {
      return JSON.stringify(session)
    }).join('\n');

    await fse.outputJSON(`tmp/${sessionsOutputFile}`, sessionsAsJSONL);

    const sessionsBuffer = await fse.readFile(`tmp/${sessionsOutputFile}`);

    await storage.upload({ file: { buffer: sessionsBuffer, size: sessionsBuffer.length, type: 'application/json' }, uploadPath: sessionsOutputFile });

    // OUTPUT META
    let runObject = pick(run, ['project', '_id', 'name', 'annotationType', 'prompt', 'promptVersion', 'model']);

    // @ts-ignore
    runObject.sessionsCount = run.sessions.length;

    metaArray.push(runObject);

    const metaAsJSONL = map(metaArray, (meta) => {
      return JSON.stringify(meta)
    }).join('\n');

    await fse.outputJSON(`tmp/${metaOutputFile}`, metaAsJSONL);

    const metaBuffer = await fse.readFile(`tmp/${metaOutputFile}`);

    await storage.upload({ file: { buffer: metaBuffer, size: metaBuffer.length, type: 'application/json' }, uploadPath: metaOutputFile });

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