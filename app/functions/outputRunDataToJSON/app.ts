import fse from 'fs-extra';
import map from 'lodash/map.js';
import type { Run } from '~/modules/runs/runs.types';
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';

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

      const downloadedPath = await storage.download({ sourcePath: sessionPath });
      const json = await fse.readJSON(downloadedPath);

      sessionsArray.push(json);
    }

    const sessionsAsJSONL = map(sessionsArray, (session) => {
      return JSON.stringify(session)
    }).join('\n');

    await fse.outputJSON(`tmp/${sessionsOutputFile}`, sessionsAsJSONL);

    const sessionsBuffer = await fse.readFile(`tmp/${sessionsOutputFile}`);

    await storage.upload({ file: { buffer: sessionsBuffer, size: sessionsBuffer.length, type: 'application/json' }, uploadPath: sessionsOutputFile });

    // OUTPUT META
    let runObject: any = {
      project: run.project,
      _id: run._id,
      name: run.name,
      annotationType: run.annotationType,
      model: run.model,
      sessionsCount: run.sessions.length
    };

    // Use snapshot data if available for reproducibility
    if (run.snapshot?.prompt) {
      runObject.prompt = {
        name: run.snapshot.prompt.name,
        userPrompt: run.snapshot.promptVersion.userPrompt,
        version: run.snapshot.promptVersion.version,
        annotationType: run.snapshot.prompt.annotationType
      };
    } else {
      // Fallback to IDs for old runs without snapshots
      runObject.prompt = run.prompt;
      runObject.promptVersion = run.promptVersion;
    }

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
