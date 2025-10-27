import type { Route } from ".react-router/types/app/+types/root"
import mongoose from 'mongoose';

const checkParamsExist = (paramKeys: string[]) => {
  let missingParams = [];
  for (const paramKey of paramKeys) {
    if (!process.env[paramKey]) {
      missingParams.push(paramKey);
    }
  }
  return missingParams;
}

export async function loader({ request }: Route.LoaderArgs) {

  let missingParameters: any[] = [];

  let {
    LLM_PROVIDER,
    STORAGE_ADAPTER,
    DOCUMENTS_ADAPTER,
  } = process.env;

  if (LLM_PROVIDER === 'AI_GATEWAY') {
    missingParameters = missingParameters.concat(checkParamsExist([
      'AI_GATEWAY_KEY',
      'AI_GATEWAY_BASE_URL',
      'AI_GATEWAY_PROVIDER'
    ]));
  }

  if (STORAGE_ADAPTER === 'AWS_S3') {
    missingParameters = missingParameters.concat(checkParamsExist([
      'AWS_BUCKET',
      'AWS_REGION',
      'AWS_KEY',
      'AWS_SECRET'
    ]));
  }

  if (DOCUMENTS_ADAPTER === 'DOCUMENT_DB') {
    missingParameters = missingParameters.concat(checkParamsExist([
      'DOCUMENT_DB_CONNECTION_STRING',
      'DOCUMENT_DB_USERNAME',
      'DOCUMENT_DB_PASSWORD',
      'REDIS_URL'
    ]));
  }
  missingParameters = missingParameters.concat(checkParamsExist([
    'SESSION_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'SUPER_ADMIN_GITHUB_ID',
    'AUTH_CALLBACK_URL'
  ]));

  let dbStatus = 'DISCONNECTED';

  const isDocumentDB = process.env.DOCUMENTS_ADAPTER === 'DOCUMENT_DB';

  if (isDocumentDB) {
    dbStatus = mongoose.STATES[mongoose.connection.readyState].toUpperCase();
  } else {
    dbStatus = 'CONNECTED';
  }

  return {
    status: 200,
    message: 'HEALTHY',
    dbStatus,
    missingParameters
  }

}