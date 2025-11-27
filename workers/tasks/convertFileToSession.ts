import dotenv from 'dotenv';
import fse from 'fs-extra';
import map from 'lodash/map';
import path from 'path';
import getDocumentsAdapter from '../../app/modules/documents/helpers/getDocumentsAdapter';
import type { Session } from '../../app/modules/sessions/sessions.types';
import getStorageAdapter from '../../app/modules/storage/helpers/getStorageAdapter';
import emitFromJob from '../helpers/emitFromJob';
dotenv.config({ path: '.env' });

export default async function convertFileToSession(job: any) {

  const { projectId, sessionId, inputFile, outputFolder, team, attributesMapping } = job.data;

  try {

    await emitFromJob(job, {
      projectId,
      sessionId,
    }, 'STARTED');

    const storage = getStorageAdapter();

    const downloadedPath = await storage.download({ sourcePath: inputFile });

    const outputFileName = path.basename(inputFile).replace('.json', '').replace('.vtt', '');

    if (attributesMapping.session_id && attributesMapping.role && attributesMapping.content && attributesMapping.sequence_id) {
      const jsonFile = await fse.readJSON(downloadedPath);

      const transcript = map(jsonFile, (dataItem, index) => {
        return {
          _id: `${index}`,
          role: dataItem.role,
          content: dataItem.content,
          start_time: dataItem.start_time,
          end_time: dataItem.end_time,
          timestamp: dataItem.timestamp,
          session_id: dataItem.session_id,
          sequence_id: dataItem.sequence_id,
          annotations: [],
        }
      })
      const json = {
        transcript,
        leadRole: attributesMapping.leadRole,
        annotations: [],
      }
      await fse.outputJSON(`tmp/${outputFolder}/${outputFileName}.json`, json);
    } else {
      throw new Error("Files do not match the given format");
    }

    const buffer = await fse.readFile(`tmp/${outputFolder}/${outputFileName}.json`);

    await storage.upload({ file: { buffer, size: buffer.length, type: 'application/json' }, uploadPath: `${outputFolder}/${outputFileName}.json` });

    const documents = getDocumentsAdapter();

    await documents.updateDocument<Session>({
      collection: 'sessions',
      match: {
        _id: sessionId
      },
      update: {
        hasConverted: true
      }
    });

    const sessionsCount = await documents.countDocuments({ collection: 'sessions', match: { project: projectId } }) as number;

    const completedSessionsCount = await documents.countDocuments({ collection: 'sessions', match: { project: projectId, hasConverted: true } }) as number;

    await emitFromJob(job, {
      projectId,
      sessionId,
      progress: Math.round((100 / sessionsCount) * completedSessionsCount),
    }, 'FINISHED');

  } catch (error: any) {
    const documents = getDocumentsAdapter();

    await documents.updateDocument<Session>({
      collection: 'sessions',
      match: {
        _id: sessionId
      },
      update: {
        hasErrored: true,
        error: error.message
      }
    });

    await emitFromJob(job, {
      projectId,
      sessionId,
    }, 'ERRORED');
    return {
      status: 'ERRORED',
      error: error.message
    }
  }

};
