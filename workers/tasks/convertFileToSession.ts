import dotenv from 'dotenv';
import fse from 'fs-extra';
import path from 'path';
import getSockets from 'workers/helpers/getSockets';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import LLM from '~/modules/llm/llm';
import getStorageAdapter from '~/modules/storage/helpers/getStorageAdapter';
import convertToSessionPrompts from '../prompts/convertFileToSession.prompts.json';
import transcriptSchema from "../schemas/transcript.schema.json";
dotenv.config({ path: '.env' });

export default async function convertFileToSession(job: any) {

  const { projectId, sessionId, inputFile, outputFolder, team } = job.data;

  const sockets = await getSockets();

  sockets.emit('CONVERT_FILES_TO_SESSIONS', {
    projectId,
    sessionId,
    task: 'CONVERT_FILE_TO_SESSION',
    status: 'STARTED'
  });

  const storage = getStorageAdapter();

  await storage.download({ downloadPath: inputFile });

  const data = await fse.readFile(path.join('tmp', inputFile));

  const outputFileName = path.basename(inputFile).replace('.json', '').replace('.vtt', '');

  const llm = new LLM({ quality: 'high', retries: 3, model: 'GEMINI', user: team })

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

  sockets.emit('CONVERT_FILES_TO_SESSIONS', {
    projectId,
    sessionId,
    task: 'CONVERT_FILE_TO_SESSION',
    status: 'FINISHED',
    progress: Math.round((100 / sessionsCount) * completedSessionsCount)
  });

};
