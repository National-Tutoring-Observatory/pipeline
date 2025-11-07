import type { Job } from "bullmq";
import convertedFilesToSessions from "workers/tasks/convertedFilesToSessions";
import '~/modules/documents/documents';
import '~/modules/storage/storage';
import annotatePerSession from "../tasks/annotatePerSession";
import annotatePerUtterance from "../tasks/annotatePerUtterance";
import convertFilesToSessions from "../tasks/convertFilesToSessions";
import convertFileToSession from "../tasks/convertFileToSession";
import startRunAnnotation from "../tasks/startRunAnnoation";

export default async (job: Job) => {
  try {
    switch (job.name) {
      case 'START_RUN_ANNOTATION': {
        await startRunAnnotation(job);
        break;
      }
      case 'ANNOTATE_PER_UTTERANCE': {
        await annotatePerUtterance(job);
        break;
      }
      case 'ANNOTATE_PER_SESSION': {
        await annotatePerSession(job);
        break;
      }
      case 'CONVERT_FILES_TO_SESSIONS': {
        await convertFilesToSessions(job);
        break;
      }
      case 'CONVERT_FILE_TO_SESSION': {
        await convertFileToSession(job);
        break;
      }
      case 'CONVERTED_FILES_TO_SESSIONS': {
        await convertedFilesToSessions(job);
      }
    }
  } catch (error) {
    console.log(error);
    // @ts-ignore
    throw new Error(error);
  }
}
