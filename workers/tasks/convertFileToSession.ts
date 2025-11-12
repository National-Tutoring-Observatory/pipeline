import dotenv from 'dotenv';
import fse from 'fs-extra';
import path from 'path';
import emitFromJob from 'workers/helpers/emitFromJob';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import LLM from '~/modules/llm/llm';
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';
import convertToSessionPrompts from '../prompts/convertFileToSession.prompts.json';
import transcriptSchema from "../schemas/transcript.schema.json";
dotenv.config({ path: '.env' });

export default async function convertFileToSession(job: any) {

  const { projectId, sessionId, inputFile, outputFolder, team } = job.data;

  try {


    await emitFromJob(job, {
      projectId,
      sessionId,
    }, 'STARTED');

    const storage = getStorageAdapter();

    const downloadedPath = await storage.download({ sourcePath: inputFile });
    const data = await fse.readFile(downloadedPath);

    const outputFileName = path.basename(inputFile).replace('.json', '').replace('.vtt', '');

    const llm = new LLM({ quality: 'high', retries: 3, model: 'GEMINI', user: team });

    llm.setOrchestratorMessage(convertToSessionPrompts.orchestrator, { schema: JSON.stringify(transcriptSchema) });

    llm.addSystemMessage(convertToSessionPrompts.system, {});

    llm.addUserMessage(convertToSessionPrompts.user, { schema: JSON.stringify(transcriptSchema), data });

    const response = await llm.createChat();

    await fse.outputJSON(`tmp/${outputFolder}/${outputFileName}.json`, response);

    const buffer = await fse.readFile(`tmp/${outputFolder}/${outputFileName}.json`);

    await storage.upload({ file: { buffer, size: buffer.length, type: 'application/json' }, uploadPath: `${outputFolder}/${outputFileName}.json` });

    const documents = getDocumentsAdapter();

    await documents.updateDocument({
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

    await documents.updateDocument({
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
